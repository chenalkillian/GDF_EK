import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import './Admin.css';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import Video from '../img/city-night-panorama-moewalls-com.mp4';

//page faite par elyes

//composant réservé au user qui sont Admin
function PageAdmin() {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [totalFile, setTotalFile] = useState(2);
  const [totalFileNow, setTotalFileNow] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [totalFileByUser, setFileByUser] = useState([]);
  const [AllFileOfUsers, setAllfilesOFUsers] = useState([]);

  // États pour le filtrage et le tri
  const [filterNom, setFilterNom] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [sortType, setSortType] = useState('date'); // Ajout d'état pour le tri

  useEffect(() => {
    const value = Cookies.get('token');
    if (value) {
      const decodedToken = jwtDecode(value);
      const tokenData = JSON.parse(value);

      setUserId(decodedToken.id);
      setRole(decodedToken.role);
      setToken(tokenData);
    }
  }, []);


  // on appelle les api qui permettent d'avoir des infos sur les user, les fichiers etc...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('http://localhost:8000/file/fileAllcount', {
          token: token
        });
        if (response.status === 200) {
          setTotalFile(response.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error);
      }

      try {
        const responseNow = await axios.post('http://localhost:8000/file/fileAllcountNow', {
          token: token
        });
        if (responseNow.status === 200) {
          setTotalFileNow(responseNow.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error);
      }

      try {
        const FileByUsers = await axios.post('http://localhost:8000/file/repartition', {
          token: token
        });
        if (FileByUsers.status === 200) {
          setFileByUser(FileByUsers.data);
          console.log(FileByUsers.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite , attention :', error);
      }

      try {
        const AllFilesOFUsers = await axios.post('http://localhost:8000/file/showAllFiles', {
          token: token
        });
        if (AllFilesOFUsers.status === 200) {
          setAllfilesOFUsers(AllFilesOFUsers.data);
          console.log(AllFilesOFUsers.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite , attention :', error);
      }
    };

    fetchData();
  }, [token]);

  const data = {
    labels: ['Total de fichier uploadé', 'Fichier uploadé aujourd\'hui'],
    datasets: [
      {
        label: 'Nombre de fichiers',
        data: [totalFile, totalFileNow],
        backgroundColor: ['#5eabbae5', '#454040'], // Liste des couleurs de fond
 
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white', // Couleur des labels de la légende
          font: {
            size: 20 // Taille de la police des labels de la légende
          }
        }
      },
      tooltip: {
        titleColor: 'white', // Couleur du titre des tooltips
        bodyColor: 'white', // Couleur du texte des tooltips
        backgroundColor: '#5eabbae5', // Couleur de fond des tooltips pour plus de contraste
      }
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'radar':
        return <Radar data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  // Filtrage et tri des fichiers
  const filteredFiles = AllFileOfUsers
    .filter(file => 
      (filterNom === '' || file.nom.toLowerCase().includes(filterNom.toLowerCase())) &&
      (filterDate === '' || file.createdAt.includes(filterDate)) &&
      (filterUserId === '' || file.userid.toString().includes(filterUserId))
    )
    .sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt); // Tri par date d'upload
      } else if (sortType === 'size') {
        return b.Taille - a.Taille; // Tri par taille
      }
      return 0;
    });



    const formatBytes = (bytes, decimalPlaces = 2) => {
      if (bytes === 0) return '0 Byte';
      const k = 1024;
      const dm = decimalPlaces < 0 ? 0 : decimalPlaces;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      // Retourne la valeur avec le nombre de décimales spécifiées
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    
    
    return (
      <>
        <video autoPlay muted loop className="background-video">
          <source src={Video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
    
        {role === 'Admin' ? (
          <div>
            <h1 className='title_table'>Choisir le type de graphique : </h1>
            <div className='select'>
              <select className='optionSelect' id="chartType" value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="radar">Radar</option>
              </select>
            </div>
            <div className='tableStat'>
              {renderChart()}
            </div>
    
            <h2 className='title_table'>Liste des utilisateurs</h2>
            <div className='infos_users'>
              <table className='infosTable'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom et prénom</th>
                    <th>Nombre de fichiers uploadés</th>
                    <th>Stockage utilisé / Total</th>
                  </tr>
                </thead>
                <tbody>
                  {totalFileByUser.map(file => (
                <tr key={file.userId}>
                <td>{file.userId}</td>
                <td>{file.nom} {file.prenom}</td>
                <td>{file.nombre_de_fichiers}</td>
                <td>{formatBytes(file.taille_totale_fichiers)} utilisé sur {formatBytes(parseFloat(file.quantiteStockage), 2)}</td>
              </tr>
               
                  ))}
                </tbody>
              </table>
            </div>
    
            <h2 className='title_table'>Liste des fichiers</h2>
            <div className='select2'>
              <input
                className='search-input2'
                type="text"
                placeholder="Filtrer par nom de fichier"
                value={filterNom}
                onChange={(e) => setFilterNom(e.target.value)}
              />
              <input
                className='filter-select2'
                type="date"
                placeholder="Filtrer par date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <input
                className='sort-select2'
                type="text"
                placeholder="Filtrer par ID d'utilisateur"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />
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
    
            <table className='infosTable2'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom du fichier</th>
                  <th>Taille</th>
                  <th>Date de création</th>
                  <th>Id de l'utilisateur</th>
                  <th>Email de l'utilisateur</th>
                </tr>
              </thead>
              <tbody className='allfiles'>
                {filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>{file.id}</td>
                    <td>{file.nom}</td>
                    <td>{formatBytes(file.Taille)}</td>
                    <td>{file.createdAt}</td>
                    <td>{file.userid}</td>
                    <td>{file.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="denied-container">
            <div className="overlay">
              <h1 className="denied-text">Vous n'avez pas le droit</h1>
              <button onClick={() => window.location.href='/User'} className='delete-button'>Retour</button>
            </div>
          </div>
        )}
      </>
    );
    }

export default PageAdmin;
