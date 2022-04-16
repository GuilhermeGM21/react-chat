import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Message from '../components/Message';
import Menu from '../components/svg/Menu';

const Home = () => {

  

  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState('');
  const [img, setImg] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [open, setOpen] = useState(true);

  const user1 = auth.currentUser.uid

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', 'not-in', [user1]));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = []
      querySnapshot.forEach((doc) => {
        users.push(doc.data())
      });
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = (user) => {
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

    const msgsRef = collection(db, 'messages', id, 'chat');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    onSnapshot(q, querySnapshot => {
      let msgs = []
      querySnapshot.forEach(doc => {
        msgs.push(doc.data())
      })
      setMsgs(msgs)
    })
  };

  const handleSubmit = async e => {
    e.preventDefault()
    const user2 = chat.uid
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`

    let url;
    if (img) {
      const imgRef = ref(storage, `images/${new Date().getTime()} - ${img.name}`);
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    await addDoc(collection(db, 'messages', id, 'chat'), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });
    setText('');
  }


  return (
    <div className='home_container'>
      {open ?
      <div onClick={() => {setOpen(!open)}} className='menu' style={{cursor: 'pointer', zIndex: 1}}>
        <Menu />
      </div> : <div onClick={() => {setOpen(!open)}} className='menu' style={{cursor: 'pointer', zIndex: 1, left: '10px'}}>
        <Menu />
      </div>
      }
      { open ? 
        <div className='users_container' style={{position: 'absolute', left: '10px'}}>
          {users.map(user => <User key={user.uid} user={user} selectUser={selectUser} />)}
        </div> : <div className='users_container' style={{ position: 'relative',left: '-125px', width: "1px"}}></div> }
        <div className='messages_container'>
          {chat ? (
            <>
            <div className='messages_user'>
              
            <h3>{chat.name}</h3>
            </div>
            <div className='messages'>
              {msgs.length ? msgs.map((msg, i) => <Message key={i} msg={msg} user1={user1}/>) : null}
            </div>
            <MessageForm handleSubmit={handleSubmit} text={text} setText={setText} setImg={setImg} />
            </>) : (<h3 className='no_conv'>Selecione um usuário para iniciar uma conversa</h3>)}
        </div>
    </div>
  )
}

export default Home