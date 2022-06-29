import React, { useState, useRef, useEffect, useMemo } from 'react';
import { parseString } from 'whatsapp-chat-parser';

import MessageViewer from './components/MessageViewer/MessageViewer';
import * as S from './style';
import raw from './chat.txt';

const DEFAULT_LOWER_LIMIT = 1;
const DEFAULT_UPPER_LIMIT = 100000;

const showError = (message, err) => {
  console.error(err || message); // eslint-disable-line no-console
  alert(message); // eslint-disable-line no-alert
};

const replaceEncryptionMessageAuthor = messages =>
  messages.map((message, i) => {
    if (i < 10 && message.message.includes('end-to-end')) {
      return { ...message, author: 'System' };
    }
    return message;
  });

const App = () => {
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState('');
  const [lowerLimit] = useState(DEFAULT_LOWER_LIMIT);
  const [upperLimit] = useState(DEFAULT_UPPER_LIMIT);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeButtonRef = useRef(null);
  const openButtonRef = useRef(null);
  const isFirstRender = useRef(true);

  const participants = useMemo(
    () =>
      Array.from(new Set(messages.map(({ author }) => author))).filter(
        author => author !== 'System',
      ),
    [messages],
  );

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const txtLoadEndHandler = e => {
    parseString(e.target.result)
      .then(replaceEncryptionMessageAuthor)
      .then(setMessages)
      .catch(err =>
        showError('An error has occurred while parsing the file', err),
      );
  };

  const processFile = file => {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('loadend', txtLoadEndHandler);
    reader.readAsText(file);
  };

  useEffect(() => {
    if (isFirstRender.current) return;

    if (isMenuOpen) closeButtonRef.current.focus();
    else openButtonRef.current.focus();
  }, [isMenuOpen]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    fetch(raw)
      .then(r => r.blob())
      .then(text => {
        processFile(text);
      });
  }, []);

  useEffect(() => {
    const keyDownHandler = e => {
      if (e.keyCode === 27) closeMenu();
    };

    document.addEventListener('keydown', keyDownHandler);
    return () => document.removeEventListener('keydown', keyDownHandler);
  }, []);

  useEffect(() => {
    setActiveUser(participants[0] || '');
  }, [messages]);

  return (
    <>
      <S.GlobalStyles />
      <S.Container>
        <MessageViewer
          messages={messages}
          participants={participants}
          activeUser={activeUser}
          lowerLimit={lowerLimit}
          upperLimit={upperLimit}
        />
      </S.Container>
    </>
  );
};

export default App;
