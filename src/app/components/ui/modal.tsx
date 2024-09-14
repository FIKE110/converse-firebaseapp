import React from 'react';

const Modal = ({ isOpen, closeModal,heading,title }:{isOpen:boolean,closeModal:()=>void,heading:string,title:string}) => {
  if (!isOpen) return null;

  console.log(heading,title)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-primary mb-4">{heading}</h2>
        <p className="mb-4 text-primary">Passcode : <b>{title}</b></p>
        <button
          onClick={closeModal}
          className="bg-primary text-white px-4 py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
