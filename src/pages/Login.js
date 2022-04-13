import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore'
import { useHistory } from 'react-router-dom';

const Login = () => {

    const [data, setData] = useState({
        email: '',
        password: '',
        error: null,
        loading: false,
    });

    const history = useHistory();

    const {email, password, error, loading} = data;

    const handleChange = e => {
        setData({ ...data, [e.target.name]: e.target.value })
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setData({ ...data, error:null, loading: true })
        if(!email || !password) {
            setData({ ...data, error: "Todos os campos precisam estar preenchidos."});
        }
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)

            await updateDoc(doc(db, 'users', result.user.uid), {
                isOnline: true,
            });
            setData({name: '', email: '', password: '', error: null, loading: false,})
            history.replace("/");
        } catch (err) {
            setData({ ...data, error: err.message, loading: false});
        }
    }
    
  return (
    <section>
        <h3>Entre em uma conta</h3>
        <form className='form' onSubmit={handleSubmit}>
            <div className='input_container'>
                <label htmlFor='email'>E-mail</label>
                <input type="text" name='email' value={email} onChange={handleChange}/>
            </div><div className='input_container'>
                <label htmlFor='password'>senha</label>
                <input type="password" name='password' value={password} onChange={handleChange}/>
            </div>
            {error ? <p className='error'>{error}</p> : null}
            <div className='btn_container'>
                <button className='btn' disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
            </div>
        </form>
    </section>
  )
}

export default Login