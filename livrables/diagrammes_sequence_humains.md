# Diagrammes de sequence - interactions humaines

Ces diagrammes de sequence decrivent les interactions metier du systeme AGCE CRM.
Ils evitent volontairement les details techniques comme le frontend, le backend, les API ou la base de donnees.

## 1. Creation d'une organisation

```mermaid
sequenceDiagram
    autonumber
    actor SD as Employe Service Delivery
    participant CRM as Systeme AGCE CRM
    participant Responsable as Responsable interne

    SD->>CRM: Accede a l'espace Organisations
    CRM-->>SD: Affiche la liste des organisations existantes
    SD->>CRM: Demande l'ajout d'une nouvelle organisation
    CRM-->>SD: Affiche le formulaire de creation
    SD->>CRM: Saisit le nom, secteur, email, telephone et adresse
    SD->>CRM: Valide la creation
    CRM->>CRM: Verifie les champs obligatoires
    CRM->>CRM: Controle le format de l'email et du telephone

    alt Informations incompletes ou invalides
        CRM-->>SD: Signale les erreurs a corriger
        SD->>CRM: Corrige les informations
        SD->>CRM: Valide a nouveau
    else Informations valides
        CRM->>CRM: Enregistre l'organisation
        CRM-->>SD: Confirme la creation de l'organisation
        CRM-->>SD: Actualise la liste des organisations
    end

    opt Besoin de controle interne
        SD->>Responsable: Informe que l'organisation a ete ajoutee
        Responsable-->>SD: Confirme la coherence des informations
    end
```

## 2. Creation d'un contact

```mermaid
sequenceDiagram
    autonumber
    actor SD as Employe Service Delivery
    actor Client as Representant client
    participant CRM as Systeme AGCE CRM

    SD->>CRM: Ouvre la fiche de l'organisation concernee
    CRM-->>SD: Affiche les details de l'organisation et ses contacts
    SD->>Client: Demande les informations du nouveau contact
    Client-->>SD: Fournit nom, type, email, telephone et fonction
    SD->>CRM: Demande la creation d'un contact
    CRM-->>SD: Affiche le formulaire de contact
    SD->>CRM: Renseigne les informations du contact
    SD->>CRM: Valide la creation
    CRM->>CRM: Verifie les champs obligatoires
    CRM->>CRM: Controle le format de l'email et du telephone
    CRM->>CRM: Verifie la regle du contact Applicant pour l'organisation

    alt Contact deja existant ou regle metier non respectee
        CRM-->>SD: Affiche le motif du refus
        SD->>Client: Demande une clarification ou une correction
        Client-->>SD: Fournit les informations corrigees
        SD->>CRM: Corrige puis valide a nouveau
    else Contact valide
        CRM->>CRM: Associe le contact a l'organisation
        CRM-->>SD: Confirme la creation du contact
        CRM-->>SD: Actualise la liste des contacts de l'organisation
    end
```

## 3. Creation d'un ticket

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client ou contact demandeur
    actor SD as Employe Service Delivery
    participant CRM as Systeme AGCE CRM
    participant Support as Equipe IT ou PKI
    participant Manager as Manager

    Client->>SD: Signale une demande ou un incident
    SD->>CRM: Accede a l'espace de creation de ticket
    CRM-->>SD: Affiche le formulaire de creation
    SD->>CRM: Selectionne l'organisation concernee
    CRM-->>SD: Affiche les contacts associes
    SD->>CRM: Selectionne le contact demandeur
    SD->>CRM: Renseigne l'application, le type de probleme, le niveau et la description
    SD->>CRM: Valide la creation du ticket
    CRM->>CRM: Verifie les champs obligatoires
    CRM->>CRM: Attribue un code de demande et le statut Pending

    alt Informations manquantes
        CRM-->>SD: Signale les champs a completer
        SD->>Client: Demande les precisions necessaires
        Client-->>SD: Donne les precisions
        SD->>CRM: Complete le ticket et valide a nouveau
    else Ticket complet
        CRM->>CRM: Enregistre le ticket
        CRM-->>SD: Confirme la creation du ticket
        CRM-->>SD: Affiche le ticket dans la liste de suivi
    end

    opt Affectation du traitement
        SD->>CRM: Affecte le ticket au service IT ou PKI
        CRM-->>Support: Rend le ticket visible pour l'equipe concernee
        Support-->>SD: Prend connaissance du ticket
    end

    opt Supervision
        Manager->>CRM: Consulte les tickets crees
        CRM-->>Manager: Affiche le ticket en lecture et son etat de suivi
    end
```

## 4. Creation d'un employe

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrateur
    actor Employe as Nouvel employe
    participant CRM as Systeme AGCE CRM
    participant Responsable as Responsable du service

    Responsable->>Admin: Demande la creation d'un compte employe
    Responsable-->>Admin: Fournit l'identite, l'email, le role, le service et le statut attendu
    Admin->>CRM: Accede a l'administration des employes
    CRM-->>Admin: Affiche la liste des employes
    Admin->>CRM: Demande l'ajout d'un nouvel employe
    CRM-->>Admin: Affiche le formulaire de creation
    Admin->>CRM: Saisit prenom, nom, email, nom utilisateur, mot de passe, service et statut
    Admin->>CRM: Valide la creation du compte
    CRM->>CRM: Verifie les champs obligatoires
    CRM->>CRM: Controle l'unicite de l'email et du nom utilisateur
    CRM->>CRM: Verifie que le service et le statut sont valides

    alt Donnees invalides ou compte deja existant
        CRM-->>Admin: Affiche l'erreur de creation
        Admin->>Responsable: Demande une correction ou une confirmation
        Responsable-->>Admin: Fournit les informations corrigees
        Admin->>CRM: Corrige puis valide a nouveau
    else Donnees valides
        CRM->>CRM: Cree le compte employe
        CRM-->>Admin: Confirme la creation du compte
        CRM-->>Admin: Actualise la liste des employes
        Admin->>Employe: Communique les informations de connexion
        Employe->>CRM: Se connecte avec son compte
        CRM-->>Employe: Donne acces selon son role et son service
    end

    opt Compte inactif au depart
        CRM-->>Employe: Refuse l'acces tant que le compte est inactif
        Employe->>Admin: Demande l'activation du compte
        Admin->>CRM: Active le compte employe
        CRM-->>Admin: Confirme l'activation
    end
```

