import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './PageUser.css';
import logo from '../img/dossier.png';
import Delete from '../img/delete.png';
import Ajouter from '../img/ajouter.png';
import Video from '../img/city-night-panorama-moewalls-com.mp4'


//page faite par elyes


//composant permettant au user d'insérer, supprimer et télécharger les fichier insérer
function PageAccueil() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [userId, setUserid] = useState('');
  const [token, setToken] = useState('');
  const [denied, setDenied] = useState(false);
  const [quantiteStockage, setQuantiteStockage] = useState(0);
  const [stockageDisponible, setStockageDisponible] = useState(0);
  const [userInfos, setUserInfos] = useState({});
  const [Buttonenable, setButton] = useState(true);

  const [fileName, setFileName] = useState('');
  const [fileToSend, setFileToSend] = useState(null);
  const [fileTaille, setFileTaille] = useState('');
  
  const [sortType, setSortType] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState('');

  useEffect(() => {
    const value = Cookies.get('token');
    if (value) {
      const tokenData = JSON.parse(value);
      const decodedToken = jwtDecode(tokenData);
      
      setUserid(decodedToken.id);
      setQuantiteStockage(decodedToken.quantiteStockage);
      setToken(tokenData);

      fetchFiles(decodedToken.id, tokenData);
      fetchUserInfos(decodedToken.id);
    } else {
      window.location.href = '/Denied';
    }
  }, []);

  // on appelle l'api pour voir les fichiers présent ou pas
  const fetchFiles = async (id, tokenData) => {
    try {
      const response = await axios.post('http://localhost:8000/file/show', {
        token: tokenData,
        userID: id,
      });

      if (response.status === 200) {
        setFiles(response.data.files);
        setFilteredFiles(response.data.files); // Initialiser les fichiers filtrés
      } else {
        setDenied(true);
      }
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error);
    }
  };

  // on appelle l'api qui permet de récupérer les informations de l'utilisateur
  const fetchUserInfos = async (id) => {
    try {
      const response = await axios.post('http://localhost:8000/user/infosuser', {
        userID: id,
      });

      if (response.status === 200) {
        setUserInfos(response.data.user);
        setStockageDisponible(response.data.user.stockagedisponible);
      } else {
        setDenied(true);
      }
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération des informations utilisateur :', error);
    }
  };

  //met à jour le nom du fichier
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileToSend(file);
      setFileTaille(file.size);
      if (file.size < quantiteStockage) {
        setButton(false);
      }
    }
  };


  //function qui appelle l'api pour insérer un fichier
  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', fileToSend);
      formData.append('nom', fileName);
      formData.append('taille', fileTaille);
      formData.append('userid', userId);
      formData.append('stockagedisponible', stockageDisponible);
      formData.append('type', fileToSend.type);

      if (fileTaille > stockageDisponible || fileTaille > quantiteStockage) {
        alert('Votre fichier dépasse la taille de stockage disponible');
      } else {
        const response = await axios.post('http://localhost:8000/file/addFile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Fichier envoyé avec succès');
        fetchFiles(userId, token);
        setStockageDisponible(response.data);
      }
    } catch (error) {
      console.error('Une erreur s\'est produite lors de l\'envoi du fichier :', error);
    }
  };


  // function qui appelle l'api pour supprimer un fichier
  const handleFileDelete = async (ID, fileSize) => {
    try {
      const data = {
        id: ID,
        token: token,
      };

      const response = await axios.post('http://localhost:8000/file/delete', data);

      if (response.status === 200) {
        alert('Fichier supprimé avec succès');
        setFiles(files.filter(file => file.id !== ID));
        setFilteredFiles(filteredFiles.filter(file => file.id !== ID)); // Mise à jour des fichiers filtrés
        updateUserStorage(fileSize);
      }
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la suppression du fichier :', error);
    }
  };

  //function qui apppelle l'api de mise à jours du stockage disponible pour l'utilisateur
  const updateUserStorage = async (fileSize) => {
    try {
      const newStorage = stockageDisponible + fileSize;
      await axios.post('http://localhost:8000/user/updateuser', {
        id: userId,
        size: newStorage,
      });
      setStockageDisponible(newStorage);
    } catch (error) {
      console.error('Une erreur s\'est produite lors de la mise à jour du stockage utilisateur :', error);
    }
  };

  const handleDeleteClick = (fileId, fileSize) => {
    handleFileDelete(fileId, fileSize);
  };

  useEffect(() => {
    let updatedFiles = [...files];

    // Filtrer par nom
    if (searchTerm) {
      updatedFiles = updatedFiles.filter(file =>
        file.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par format
    if (filterFormat) {
      updatedFiles = updatedFiles.filter(file => {
        const fileExtension = file.nom.split('.').pop(); // Récupère l'extension du fichier
        return fileExtension && fileExtension.includes(filterFormat); // Filtre par format
      });
    }

    // Trier les fichiers
    if (sortType === 'date') {
      updatedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    } else if (sortType === 'size') {
      updatedFiles.sort((a, b) => b.Taille - a.Taille);
    }

    setFilteredFiles(updatedFiles);
  }, [searchTerm, filterFormat, sortType, files]);

  return (
    <>
      <video autoPlay muted loop className="background-video">
        <source src={Video} type="video/mp4" />
      </video>

      <a onClick={() => window.location.href = '/DeleteUser'}>
        <img className='icon-delete' src={Delete} alt="Delete" />
      </a> 
      <a onClick={() => window.location.href = '/NewTarifs'}>
        <img className='icon-add' src={Ajouter} alt="Ajouter" />
      </a>
      <div className='search-filter-container'>
        <label className='search-label'>
          Rechercher un fichier :
          <input
            className='search-input'
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>

        <label className='filter-label'>
          Filtrer par format :
          <select
            className='filter-select'
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
          >
            <option value="">Tous les formats</option>
            <option value="pdf">PDF</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="docx">DOCX</option>
            <option value="xlsx">XLSX</option>
            <option value="txt">TXT</option>
            <option value="csv">CSV</option>
          </select>
        </label>

        <label className='sort-label'>
          Trier par :
          <select
            className='sort-select'
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="date">Date d'upload</option>
            <option value="size">Poids</option>
          </select>
        </label>
      </div>

      <div className='files-list'>
        {Array.isArray(filteredFiles) && filteredFiles.map((file, index) => (
          <div className='file-item' key={index}>
            {file.file && (
              <a href={URL.createObjectURL(new Blob([new Uint8Array(file.file.data)], { type: 'application/pdf' }))} download={file.nom}>
                <img className='file-logo' src={logo} alt="Logo" />
              </a>
            )}
            <p className='file-name'>{file.nom}</p>
            <button onClick={() => handleDeleteClick(file.id, file.Taille)} className='delete-button'>Supprimer</button>
          </div>
        ))}
      </div>

      <div className='upload-section'>
        <input
          id="file-upload"
          className="file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="upload-button">
          Choisissez un fichier
        </label>
        {fileName && <p className='file-name-display'>Nom du fichier: {fileName}</p>}

        <button className="upload-submit" onClick={handleFileUpload} disabled={Buttonenable}>Envoyer</button>
      </div>
    </>
  );
}

export default PageAccueil;
