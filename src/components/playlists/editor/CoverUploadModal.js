import { motion } from "framer-motion";
import { FaTimes, FaImage } from "react-icons/fa";

export default function CoverUploadModal({
  showCoverUpload,
  setShowCoverUpload,
  newCover,
  handleImageUpload
}) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowCoverUpload(false)}
    >
      <motion.div
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-700 relative"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700"
          onClick={() => setShowCoverUpload(false)}
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Upload Cover Image</h2>
        <label className="block mb-4">
          <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/70 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaImage className="text-gray-500 mb-2" size={24} />
              <p className="text-sm text-gray-400">
                {newCover ? newCover.name : "Click to upload cover image"}
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </div>
        </label>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            onClick={() => setShowCoverUpload(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
            onClick={() => setShowCoverUpload(false)}
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}