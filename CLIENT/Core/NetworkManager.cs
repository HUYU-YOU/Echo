// CLIENT/Core/NetworkManager.cs
using UnityEngine;
using NativeWebSocket; // Nécessite l'installation du package NativeWebSocket
using System.Text;

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

public class NetworkManager : MonoBehaviour
{
    WebSocket websocket;

    async void Start()
    {
        // Connexion au serveur local
        websocket = new WebSocket("ws://localhost:8080");

        websocket.OnOpen += () =>
        {
            Debug.Log("Connecté au serveur !");
            // Dès qu'on est connecté, on tente de s'identifier
            SendLoginRequest("Echo", "1234");
        };

        websocket.OnError += (e) => Debug.Log("Erreur : " + e);
        websocket.OnClose += (e) => Debug.Log("Connexion fermée !");
        
        websocket.OnMessage += (bytes) =>
        {
            // Réception de la réponse du serveur
            var message = Encoding.UTF8.GetString(bytes);
            Debug.Log("Réponse du serveur : " + message);
            // C'est ici que le GameManager lira "success" pour charger la scène 02_ServerSelect
        };

        // Lancement asynchrone de la connexion
        await websocket.Connect();
    }

    void Update()
    {
        // Nécessaire pour traiter les messages entrants dans le thread principal d'Unity
        #if !UNITY_WEBGL || UNITY_EDITOR
        websocket.DispatchMessageQueue();
        #endif
    }

    public async void SendLoginRequest(string user, string pass)
    {
        // Création du paquet JSON
        AuthPacket packet = new AuthPacket
        {
            action = "login",
            data = new AuthData { username = user, password = pass }
        };

        string jsonMessage = JsonUtility.ToJson(packet);
        
        if (websocket.State == WebSocketState.Open)
        {
            await websocket.SendText(jsonMessage);
        }
    }

    private async void OnApplicationQuit()
    {
        await websocket.Close();
    }
}
