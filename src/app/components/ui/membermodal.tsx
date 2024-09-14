import React from "react";

const MembersModal = ({ members, isOpen, onClose }:{members:[],isOpen:boolean,onClose:()=>void}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary">Room Members</h2>
        <div className="overflow-y-auto max-h-72">
          {members.length > 0 ? (
            <ul className="space-y-3">
              {members.map((member, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm hover:bg-gray-200"
                >
                  <span className="font-medium text-lg text-primary">{member}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-primary">No members found</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-primary text-white px-4 py-2 rounded-lg shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MembersModal;
