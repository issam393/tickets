// Importe les hooks React utilises pour gerer l'etat, les effets et les references.
import { useCallback, useEffect, useRef, useState } from "react";
// Importe le client Socket.IO utilise par le frontend.
import { io } from "socket.io-client";
import { SOCKET_URL } from "../lib/apiConfig";

// Normalise le format d'un message recu du backend.
function normalizeMessage(message) {
  // Retourne un objet stable avec les noms de champs utilises dans l'interface.
  return {
    // Identifiant du message.
    id: message.id,
    // Identifiant numerique de la room.
    roomId: Number(message.roomId),
    // Identifiant numerique de l'expediteur.
    senderId: Number(message.senderId),
    // Nom affiche de l'expediteur.
    senderName: message.senderName,
    // Texte du message.
    text: message.text,
    // Date d'envoi du message.
    timestamp: message.timestamp,
  };
}

// Hook personnalise qui gere toute la logique Socket.IO d'une room de chat.
export default function useChatRoom(activeRoomId) {
  // Recupere le token JWT stocke apres la connexion.
  const token = localStorage.getItem("token");
  // Garde la connexion socket sans provoquer de nouveau rendu React.
  const socketRef = useRef(null);
  // Garde la room active lisible depuis les callbacks socket.
  const activeRoomRef = useRef(activeRoomId);
  // Stocke les messages affiches dans la conversation.
  const [messages, setMessages] = useState([]);
  // Indique si le socket est actuellement connecte.
  const [isSocketReady, setIsSocketReady] = useState(false);
  // Stocke l'id de la room deja rejointe.
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  // Sert a forcer le rafraichissement des listes de rooms.
  const [roomsRevision, setRoomsRevision] = useState(0);
  // Stocke l'erreur socket a afficher dans l'interface.
  const [error, setError] = useState("");

  // Met a jour la reference de room active quand l'utilisateur change de conversation.
  useEffect(() => {
    // La reference permet aux callbacks socket de connaitre la room courante.
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  // Cree et gere la connexion Socket.IO tant que le token existe.
  useEffect(() => {
    // Sans token, on ne tente pas de se connecter au socket.
    if (!token) return undefined;

    // Prepare une connexion socket avec le token dans le handshake.
    const socket = io(SOCKET_URL, {
      // Evite la connexion automatique pour installer les listeners avant.
      autoConnect: false,
      // Envoie le JWT au backend pour l'authentification socket.
      auth: { token },
    });

    // Sauvegarde la connexion dans une reference reutilisable.
    socketRef.current = socket;

    // Evenement appele quand la connexion socket est etablie.
    socket.on("connect", () => {
      // Marque le socket comme pret.
      setIsSocketReady(true);
      // Efface l'ancienne erreur.
      setError("");
    });

    // Evenement appele quand la connexion socket est coupee.
    socket.on("disconnect", () => {
      // Indique a l'interface que le socket n'est plus pret.
      setIsSocketReady(false);
    });

    // Evenement appele si le backend refuse ou echoue la connexion.
    socket.on("connect_error", (connectionError) => {
      // Affiche le message d'erreur renvoye par le backend.
      setError(connectionError.message || "Socket connection failed.");
    });

    // Evenement appele quand un nouveau message arrive du backend.
    socket.on("receive_message", (payload) => {
      // Adapte le message au format attendu par React.
      const normalized = normalizeMessage(payload);
      // Ignore le message si l'utilisateur n'est pas dans cette room active.
      if (Number(activeRoomRef.current) !== normalized.roomId) return;

      // Ajoute le nouveau message a la conversation affichee.
      setMessages((prev) => [...prev, normalized]);
      // Informe le backend que la room courante a ete lue.
      socket.emit("mark_room_read", { roomId: normalized.roomId }, (response) => {
        // Rafraichit les rooms si le backend confirme la lecture.
        if (response?.success) setRoomsRevision((previous) => previous + 1);
      });
    });

    // Evenement global envoye quand une room a recu un changement.
    socket.on("rooms_updated", () => {
      // Incremente une revision pour declencher le rechargement cote interface.
      setRoomsRevision((previous) => previous + 1);
    });

    // Lance la connexion socket apres l'installation des listeners.
    socket.connect();

    // Nettoyage execute quand le composant se demonte ou quand le token change.
    return () => {
      // Supprime tous les listeners pour eviter les doublons.
      socket.removeAllListeners();
      // Ferme la connexion socket.
      socket.disconnect();
      // Vide la reference du socket.
      socketRef.current = null;
      // Indique que le socket n'est plus pret.
      setIsSocketReady(false);
    };
  }, [token]);

  // Fonction qui demande au backend de rejoindre une room.
  const joinRoom = useCallback((roomId) => {
    // Retourne une promesse pour gerer succes et erreur proprement.
    return new Promise((resolve, reject) => {
      // Recupere le socket courant.
      const socket = socketRef.current;
      // Refuse si le socket n'est pas connecte.
      if (!socket || !socket.connected) {
        reject(new Error("Socket is not connected."));
        return;
      }

      // Envoie l'evenement join_room au backend avec l'id de la room.
      socket.emit("join_room", { roomId }, (response) => {
        // Si le backend refuse, on rejette la promesse avec son erreur.
        if (!response?.success) {
          reject(new Error(response?.error || "Could not join room."));
          return;
        }

        // Si le backend accepte, on renvoie les donnees de room et l'historique.
        resolve(response);
      });
    });
  }, []);

  // Rejoint automatiquement la room active quand elle change.
  useEffect(() => {
    // Si aucune room n'est selectionnee, rien a rejoindre.
    if (!activeRoomId) {
      return;
    }

    // Attend que le socket soit connecte avant d'appeler join_room.
    if (!isSocketReady) return;

    // Demande au backend de rejoindre la room active.
    joinRoom(activeRoomId)
      .then((result) => {
        // Efface l'erreur si l'acces est accepte.
        setError("");
        // Remplace les messages affiches par l'historique de la room.
        setMessages((result.history || []).map(normalizeMessage));
        // Memorise la room rejointe.
        setJoinedRoomId(Number(activeRoomId));
        // Rafraichit les donnees dependantes des rooms.
        setRoomsRevision((previous) => previous + 1);
      })
      .catch((joinError) => {
        // Vide les messages si l'acces a la room echoue.
        setMessages([]);
        // Indique qu'aucune room n'est correctement rejointe.
        setJoinedRoomId(null);
        // Stocke le message d'erreur a afficher.
        setError(joinError.message);
      });
  }, [activeRoomId, isSocketReady, joinRoom]);

  // Indique si l'interface est en train de rejoindre une nouvelle room.
  const isJoining =
    // Il faut une room active.
    Boolean(activeRoomId) &&
    // Il faut que le socket soit connecte.
    isSocketReady &&
    // La room rejointe doit etre differente de la room demandee.
    Number(joinedRoomId) !== Number(activeRoomId);

  // Fonction appelee par l'interface pour envoyer un message.
  const sendMessage = useCallback(
    (messageText) => {
      // Retourne une promesse pour que le composant gere le succes ou l'erreur.
      return new Promise((resolve, reject) => {
        // Recupere le socket courant.
        const socket = socketRef.current;
        // Refuse si le socket n'est pas connecte.
        if (!socket || !socket.connected) {
          reject(new Error("Socket is not connected."));
          return;
        }

        // Refuse si aucune room n'est selectionnee.
        if (!activeRoomId) {
          reject(new Error("No active room selected."));
          return;
        }

        // Envoie le message au backend avec la room active.
        socket.emit("send_message", { roomId: activeRoomId, messageText }, (response) => {
          // Si le backend refuse, on renvoie l'erreur a l'interface.
          if (!response?.success) {
            reject(new Error(response?.error || "Message could not be sent."));
            return;
          }

          // Si le backend accepte, on renvoie le message sauvegarde.
          resolve(response.data);
        });
      });
    },
    // La fonction change seulement quand la room active change.
    [activeRoomId]
  );

  // Donne au composant React toutes les valeurs et actions necessaires au chat.
  return {
    // Liste des messages de la room active.
    messages,
    // Fonction d'envoi d'un nouveau message.
    sendMessage,
    // Etat de connexion socket.
    isSocketReady,
    // Etat de chargement quand on rejoint une room.
    isJoining,
    // Room actuellement rejointe.
    joinedRoomId,
    // Compteur de revision pour rafraichir les rooms.
    roomsRevision,
    // Message d'erreur ou message demandant de se connecter.
    error: token ? error : "Please login first.",
  };
}
