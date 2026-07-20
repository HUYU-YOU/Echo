using UnityEngine;
using NativeWebSocket;
using System.Text;
using System.Threading.Tasks;

// --- STRUCTURES DE DONNÉES ---
[System.Serializable]
public class AuthPacket { public string action; public AuthData data; }
[System.Serializable]
public class AuthData { public string username; public string password; }

[System.Serializable]
public class CharacterPacket { public string action; public string token; public CharacterData data; }
[System.Serializable]
public class CharacterData { public string serverName; public string characterName; public int classId; public int skinId; public string colors; }

[System.Serializable]
public class ServerResponse { public string action; public string status; public string message; public string token; }

public class NetworkManager : MonoBehaviour
{
    public static NetworkManager Instance;
    WebSocket websocket;
    
    [HideInInspector] public string jwtToken = ""; 

    private void Awake()
    {
        if (Instance == null) { Instance = this; DontDestroyOnLoad(gameObject); }
        else { Destroy(gameObject); }
    }

    async void Start()
    {
        websocket = new WebSocket("ws://localhost:8080");
        websocket.OnOpen += () => { Debug.Log("[Réseau] Connecté au serveur !"); };
        websocket.OnError += (e) => { Debug.LogError("[Réseau] Erreur : " + e); };
        
        websocket.OnMessage += (bytes) =>
        {
            string jsonMessage = Encoding.UTF8.GetString(bytes);
            HandleServerMessage(jsonMessage);
        };

        await websocket.Connect();
    }

    void Update()
    {
        #if !UNITY_WEBGL || UNITY_EDITOR
        if (websocket != null && websocket.State == WebSocketState.Open) { websocket.DispatchMessageQueue(); }
        #endif
    }

    // --- ENVOI DES REQUÊTES ---
    public async void SendRegisterRequest(string user, string pass)
    {
        await SendText(JsonUtility.ToJson(new AuthPacket { action = "register", data = new AuthData { username = user, password = pass } }));
    }

    public async void SendLoginRequest(string user, string pass)
    {
        await SendText(JsonUtility.ToJson(new AuthPacket { action = "login", data = new AuthData { username = user, password = pass } }));
    }

    public async void SendCreateCharacter(string server, string charName, int classId, int skinId, string colorsJson)
    {
        CharacterPacket packet = new CharacterPacket
        {
            action = "create_character",
            token = jwtToken, // On envoie le badge de sécurité !
            data = new CharacterData { serverName = server, characterName = charName, classId = classId, skinId = skinId, colors = colorsJson }
        };
        await SendText(JsonUtility.ToJson(packet));
    }

    private async Task SendText(string json)
    {
        if (websocket != null && websocket.State == WebSocketState.Open) { await websocket.SendText(json); }
    }

    // --- GESTION DES RÉPONSES ---
    private void HandleServerMessage(string json)
    {
        ServerResponse response = JsonUtility.FromJson<ServerResponse>(json);

        if (response.action == "login_response" && response.status == "success")
        {
            jwtToken = response.token;
            Debug.Log("✅ Connexion réussie ! Token sauvegardé.");
        }
        else if (response.action == "create_character_response")
        {
            if (response.status == "success") Debug.Log("✅ Personnage créé et validé par le serveur ! " + response.message);
            else Debug.LogError("❌ Refus du serveur : " + response.message);
        }
        else if (response.status == "error")
        {
            Debug.LogError("❌ Erreur : " + response.message);
        }
        else if (response.status == "success")
        {
            Debug.Log("✅ Succès : " + response.message);
        }
    }

    private async void OnApplicationQuit() { if (websocket != null) await websocket.Close(); }
}
