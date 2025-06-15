// src/components/Loader.jsx
function Loader() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-6rem)]">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 border-solid"></div>
      <p className="ml-4 mt-4 text-xl text-gray-700">Carregando jogos...</p>
    </div>
  );
}

export default Loader;