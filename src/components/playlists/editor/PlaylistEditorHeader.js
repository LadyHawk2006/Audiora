import { FaSave } from "react-icons/fa";

export default function PlaylistEditorHeader({ 
  editedPlaylist, 
  isDirty, 
  isSubmitting, 
  resetChanges, 
  handleSave 
}) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl md:text-3xl font-bold">
        Editing: <span className="text-purple-400">{editedPlaylist.name}</span>
      </h1>
      <div className="flex gap-3">
        <button
          onClick={() => resetChanges()}
          disabled={!isDirty()}
          className={`px-4 py-2 rounded-lg ${!isDirty() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty() || isSubmitting}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${!isDirty() || isSubmitting ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
        >
          <FaSave /> {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}