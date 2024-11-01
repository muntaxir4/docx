import React, { useState } from "react";

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      URL.revokeObjectURL(uploadedImage!); // Clean up the previous object URL
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        if (Math.abs(width / height - 1.3333) < 0.01) {
          setUploadedImage(url);
          setImageFile(file);
          setError(null);
        } else {
          setError("Please upload an image with a 4:3 ratio.");
          setUploadedImage(null);
          setImageFile(null);
          URL.revokeObjectURL(url); // Clean up the object URL
        }
      };
      img.src = url;
    }
  };

  const handleSendToBackend = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    try {
      setResponseError(null);
      setResponseData("Processing...");
      const response = await fetch(API_URL + "/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if ("error" in data) {
        setResponseError(data.error);
        setResponseData("Error");
        return;
      }
      setResponseData(data.text);
      setResponseError(null);
    } catch (err) {
      console.error(err);
      setResponseData("Error");
      setResponseError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-between overflow-auto">
      <nav className="m-2 font-bold text-2xl text-center mx-auto border-b w-full pb-1">
        DocX
      </nav>
      <div
        className={`m-3 flex transition-all duration-500 ease-in-out ${
          responseData ? "grid sm:grid-cols-2 gap-4" : "flex-col"
        }`}
      >
        {!responseData ? (
          <div className="flex flex-col items-center">
            <div className="w-96 h-72 border border-gray-300 flex justify-center items-center mb-2">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-full max-h-full"
                />
              ) : (
                <label className="cursor-pointer text-center p-2">
                  Click to upload image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <p className="text-sm mt-2">{"(Choose 4:3 images only)"}</p>
                </label>
              )}
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {uploadedImage && (
              <button
                onClick={handleSendToBackend}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Analyze
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="m-2 grid gap-2">
              <img
                src={uploadedImage!}
                alt="Uploaded"
                className="w-full h-auto"
                hidden={!uploadedImage}
              />
              {error && <p className="text-red-500">{error}</p>}
              <div className="grid grid-cols-2 content-start items-center mx-auto gap-3">
                <label className="mx-auto cursor-pointer bg-emerald-300 p-2 rounded text-center">
                  Click to change image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {uploadedImage && (
                  <button
                    onClick={handleSendToBackend}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Analyze
                  </button>
                )}
              </div>
            </div>
            <div className="m-2 overflow-auto">
              {responseError ? (
                <p className="text-red-500">{responseError}</p>
              ) : (
                <pre>{responseData}</pre>
              )}
            </div>
          </>
        )}
      </div>
      <a
        href="/sample.jpg"
        className="m-4 text-sm mx-auto underline text-slate-500"
      >
        Sample Driving License
      </a>
    </div>
  );
}

export default App;
