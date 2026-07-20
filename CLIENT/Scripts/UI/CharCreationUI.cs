using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CharCreationUI : MonoBehaviour
{
    [Header("Informations Personnage")]
    public TMP_InputField characterNameInput;
    
    [Header("Sélection par défaut")]
    public int selectedClassId = 1; // De 1 à 6
    public int selectedSkinId = 1;  // De 1 à 4

    [Header("Validation")]
    public Button createButton;

    void Start()
    {
        createButton.onClick.AddListener(OnCreateClicked);
    }

    // Ces fonctions devront être appelées par tes boutons UI (ex: bouton Classe Guerrier appelle SelectClass(1))
    public void SelectClass(int classId) { selectedClassId = classId; Debug.Log("Classe sélectionnée : " + classId); }
    public void SelectSkin(int skinId) { selectedSkinId = skinId; Debug.Log("Skin sélectionné : " + skinId); }

    void OnCreateClicked()
    {
        string charName = characterNameInput.text;
        
        // On récupère le serveur choisi à l'étape précédente
        string serverName = PlayerPrefs.GetString("SelectedServer", "Emeryn");

        if (!string.IsNullOrEmpty(charName))
        {
            Debug.Log($"[UI] Demande de création : {charName} (Classe:{selectedClassId}, Skin:{selectedSkinId}) sur {serverName}");
            
            // Format JSON vide par défaut pour les couleurs (on l'améliorera plus tard pour ta feature de palette de couleurs)
            string colorsJson = "{}"; 
            
            NetworkManager.Instance.SendCreateCharacter(serverName, charName, selectedClassId, selectedSkinId, colorsJson);
        }
        else
        {
            Debug.LogWarning("[UI] Le nom du personnage ne peut pas être vide.");
        }
    }
}
