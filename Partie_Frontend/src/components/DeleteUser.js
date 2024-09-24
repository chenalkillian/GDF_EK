import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './DeleteUser.css';

import Cookies from 'js-cookie';
import Video from '../img/city-night-panorama-moewalls-com.mp4'



//page faite par elyes

//composant de la suppression du compte de l'utilisateur

const DeleteUser = () => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [passwordTrue, setPasswordTrue] = useState('');
    const [token, setToken] = useState('');
    const [userId, setUserid] = useState('');
    const [envoieAdmin, setSenAdmin] = useState(false);
    const [numberfiledelete, setNumberfile] = useState(18);


    //useffect qui permet de voir le contenu du cookie
    useEffect(() => {
        const fetchData = async () => {
            const value = Cookies.get('token');
            if (value) {
                const tokenData = JSON.parse(value);
                const decodedToken = jwtDecode(tokenData);
                setEmail(decodedToken.email);      
                setPasswordTrue(decodedToken.password);
                setToken(tokenData);
                setUserid(decodedToken.id);
            }
        };
    
        fetchData();
    }, []);
    

    //on appelle l'api de suppression de compte
    const handleDeleteUser = async () => {
        if (password === passwordTrue) {
            try {
                const data = { email, password };
                const response = await axios.post('http://localhost:8000/user/deleteUser', data);
                if (response.status === 200) {
                    alert('user supprimé avec succès');
                    window.location.href = '/'
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression ', error);
            }
        } else {
            alert('votre mot de passe est incorrect');
        }
    };
    
    //fonction qui appelle l'api de suppression de tous les fichier du user
    const handleFileUser = async () => {
        if (password === passwordTrue) {
            try {
                const data = { token, userid: userId };
                const response = await axios.post('http://localhost:8000/file/deleteAllfileUser', data);
                if (response.status === 200) {
                    console.log('ok');
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression ', error);
            }
        } else {
            alert('votre mot de passe est incorrect');
        }
    };


    //function qui contact l'api qui permet de compter combien de fichier du user on été supprimer, afin d'avertir le ou les admin
    const handleCountFileUser = async () => {
        if (password === passwordTrue) {
            try {
                const data = { token, userid: userId };
                const response = await axios.post('http://localhost:8000/file/filecount', data);
                if (response.status === 200) {
                    const number = response.data;
                    setNumberfile(number);
                    setSenAdmin(true);
                    return number;
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression ', error);
            }
        } else {
            alert('votre mot de passe est incorrect');
        }
    };


    // Function qui appelle l'api d'envoie de mail à l'ancien utilisateur pour lui dire que son compte et supprimer ainsi que tous ses fichiers
    const handlesendmail = async () => {
        if (password === passwordTrue) {
            try {
                const data = {
                    to: email,
                    text: 'Votre compte ainsi que vos fichiers ont été supprimés.',
                };
                const response = await axios.post('http://localhost:8000/user/senmaildelete', data);
                if (response.status === 200) {
                    alert('ok');
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression ', error);
            }
        }
    };

    // function qui envoie un mail à ou aux admins sur les détails de la suppression de compte user
    const handlesendmailAdmin = async (number) => {
        if (password === passwordTrue) {
            try {
                const data = {
                    to: 'killianc142@gmail.com',
                    text: `L'utilisateur ${email} a supprimé son compte, ${number} fichiers ont été supprimés.`,
                };
                const response = await axios.post('http://localhost:8000/user/senmaildelete', data);
                if (response.status === 200) {
                    alert('ok');
                }
            } catch (error) {
                console.error('Une erreur s\'est produite lors de la suppression ', error);
            }
        }
    };


    //function qui execute toutes les autres functions utiles à la suppression
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password === passwordTrue) {
            const number = await handleCountFileUser();
            handlesendmail();
            handleFileUser();
            handleDeleteUser();
            handlesendmailAdmin(number);
        } else {
            alert('votre mot de passe est incorrect');
        }
    };

    return (
        <><video autoPlay muted loop className="background-video">
        <source src={Video} type="video/mp4" />
      </video>
            <p className='deleteTitle'>Pour supprimer votre compte, veuillez entrer votre mot de passe</p>
                 <div className="inscription-container">
           
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="title2" htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            placeholder='mot de passe'
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />  <button className='supprimer' type="submit">Supprimer</button>
                    </div>
                  
                </form>
            </div>
        </>
    );
};

export default DeleteUser;
