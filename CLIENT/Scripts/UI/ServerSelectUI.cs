using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class ServerSelectUI : MonoBehaviour
{
    [Header("Boutons de serveurs")]
    public Button emerynButton;
    public Button elysiaButton;

    void Start()
    {
        // On attache dynamiquement nos fonctions aux clics des boutons
        emerynButton.onClick.AddListener(() => SelectServer("Emeryn"));
        elysiaButton.onClick.AddListener(() => SelectServer("Elysia"));
    }

    void SelectServer(string serverName)
    {
        // On sauvegarde temporairement le choix du serveur dans les PlayerPrefs d'Unity
        PlayerPrefs.SetString("SelectedServer", serverName);
        PlayerPrefs.Save();

        Debug.Log($"[UI] Serveur sélectionné : {serverName}. Passage à la création de personnage...");
        
        // On charge la scène de création de personnage
        SceneManager.LoadScene("03_CharCreation");
    }
}
