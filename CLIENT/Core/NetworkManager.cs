using UnityEngine;
using NativeWebSocket;
using System.Text;
using System.Threading.Tasks;

// --- STRUCTURES DE DONNÉES POUR LE JSON ---
[System.Serializable]
public class AuthPacket
{
    public string action;
    public AuthData data;
}

[System.Serializable]
public class AuthData
{
    public string username;
    public string password;
}

[System.Serializable]
public class ServerResponse
{
    public string action;
    public string status;
    public string message;
    public string token; // Sera rempli uniquement lors d'un login réussi
}

public class NetworkManager : MonoBehaviour
{
    public static NetworkManager Instance; // Pattern Singleton pour y accéder depuis n'importe quel script (ex: UI Login)

    WebSocket websocket;
    
    // C'est ici que l'on garde le précieux "badge" d'identification (JWT) du joueur
    [HideInInspector]
    public string jwtToken = ""; 

    private void Awake()
    {
        // Permet au NetworkManager de survivre lors des chargements de scènes (du Login vers la Map)
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    async void Start()
    {
        // Connexion au serveur local (À changer par l'IP de production plus tard)
        websocket = new WebSocket("ws://localhost:8080");

        websocket.OnOpen += () => 
        { 
            Debug.Log("[Réseau] Connecté au serveur !"); 
        };

        websocket.OnError += (e) => { Debug.LogError("[Réseau] Erreur : " + e); };
        websocket.OnClose += (e) => { Debug.Log("[Réseau] Connexion fermée."); };
        
        websocket.OnMessage += (bytes) =>
        {
            string jsonMessage = Encoding.UTF8.GetString(bytes);
            HandleServerMessage(jsonMessage);
        };

        await websocket.Connect();
    }

    void Update()
    {
        // Obligatoire pour traiter les messages entrants dans le thread principal d'Unity
        #if !UNITY_WEBGL || UNITY_EDITOR
        if (websocket != null && websocket.State == WebSocketState.Open)
        {
            websocket.DispatchMessageQueue();
        }
        #endif
    }

    // --- ENVOI DES REQUÊTES ---

    public async void SendRegisterRequest(string user, string pass)
    {
        AuthPacket packet = new AuthPacket { action = "register", data = new AuthData { username = user, password = pass } };
        await SendPacket(packet);
    }

    public async void SendLoginRequest(string user, string pass)
    {
        AuthPacket packet = new AuthPacket { action = "login", data = new AuthData { username = user, password = pass } };
        await SendPacket(packet);
    }

    private async Task SendPacket(AuthPacket packet)
    {
        if (websocket != null && websocket.State == WebSocketState.Open)
        {
            string json = JsonUtility.ToJson(packet);
            await websocket.SendText(json);
        }
    }

    // --- GESTION DES RÉPONSES DU SERVEUR ---

    private void HandleServerMessage(string json)
    {
        ServerResponse response = JsonUtility.FromJson<ServerResponse>(json);

        if (response.action == "login_response")
        {
            if (response.status == "success")
            {
                jwtToken = response.token;
                Debug.Log("✅ Succès ! Token JWT sauvegardé en mémoire.");
                // TODO (Plus tard) : C'est ici qu'on appellera le GameManager pour charger la Scène 02_ServerSelect
            }
            else
            {
                Debug.LogError("❌ Échec de connexion : " + response.message);
            }
        }
        else if (response.action == "register_response")
        {
            if (response.status == "success")
            {
                Debug.Log("✅ Inscription réussie, tu peux maintenant te connecter !");
            }
            else
            {
                Debug.LogError("❌ Échec de l'inscription : " + response.message);
            }
        }
    }

    private async void OnApplicationQuit()
    {
        if (websocket != null) await websocket.Close();
    }
}
