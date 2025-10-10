'use client'
import React from 'react'

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80 text-center">
        <p className="text-lg mb-4">{message || 'Ishonchingiz komilmi?'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Ha
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Yo‘q
          </button>
        </div>
      </div>
    </div>
  )
}
