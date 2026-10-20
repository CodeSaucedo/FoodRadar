import React from 'react';

type Props = {
  userId: string;
  onAdded: () => void;
  onClose: () => void;
  isOpen: boolean;
  children?: React.ReactNode;
};

export default function AddRestaurantModal({ 
  userId, 
  onAdded, 
  onClose, 
  isOpen, 
  children 
}: Props) {
  
  // If the modal isn't open, return nothing
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Your modal UI elements go here */}
        {children}
      </div>
    </div>
  );
}
