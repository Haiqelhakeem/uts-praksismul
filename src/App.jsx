import imageCompression from "browser-image-compression";
// import lamejs from "lamejs";
import ffmpeg from "ffmpeg.js/ffmpeg-mp4.js";
import { useState } from "react";
import swal from "sweetalert";



const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [processImage, setProcessImage] = useState(null);
  const [processAudio, setProcessAudio] = useState(null);

  const [compressedFile, setCompressedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setProcessAudio(null);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    setSelectedAudio(file);
    setSelectedImage(null);
  };

  const handleImageResize = async () => {
    if (selectedImage) {
      try {
        const options = {
          maxSizeMB: 50,
          maxWidthOrHeight: 300,
          useWebWorker: true,
        };
        const compressedImage = await imageCompression(selectedImage, options);
        setProcessImage(compressedImage);
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }
  };

  const handleDownloadImage = () => {
    const url = URL.createObjectURL(processImage);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resized_image.jpg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAudioCompression = async (file) => {
    setLoading(true);

    try {
      if (file.type !== "audio/mpeg") {
        swal(
          "File Error",
          "Format file tidak sesuai. Hanya file dengan format MP3 yang diizinkan.",
          "error"
        );
        setLoading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target.result;
        const transcode = ffmpeg({
          MEMFS: [{ name: file.name, data: result }],
          arguments: [
            "-i",
            file.name,
            "-b:a",
            "64k",
            "-f",
            "mp3",
            "output.mp3",
          ],
        });

        const { MEMFS } = transcode;
        const compressedBlob = new Blob([MEMFS[0].data], {
          type: "audio/mp3",
        });
        setCompressedFile(compressedBlob);
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error compressing audio:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold my-3">Image and Audio Compression</h1>
      <div className="p-10 rounded-lg shadow-lg">
        <h3 className="mb-1 text-2xl text-blue-500 font-bold ml-16">
          Image Compressor
        </h3>
        <div className="flex flex-col">
          <input className="py-2 px-6" type="file" accept="image/*" onChange={handleImageUpload} />
          <button
            className="py-2 px-6 bg-blue-300 rounded-md m-3"
            onClick={handleImageResize}
          >
            Resize Image
          </button>
          {processImage && (
            <button
              className="py-2 px-6 bg-green-300 rounded-md"
              onClick={handleDownloadImage}
            >
              Download Resized Image
            </button>
          )}
        </div>
      </div>
      <div className="p-10 rounded-lg shadow-lg mt-4 flex-col">
        <h3 className="mb-1 text-2xl text-blue-500 font-bold ml-16">Audio Compressor</h3>
        <input className="py-2 px-6 my-4" type="file" accept="audio/*" onChange={handleAudioUpload} />
        {selectedAudio && (
          <audio controls>
            <source src={URL.createObjectURL(selectedAudio)} type="audio/mp3" />
          </audio>
        )}
        <button
          className="py-2 px-6 bg-blue-300 rounded-md mt-4"
          onClick={() => handleAudioCompression(selectedAudio)}
        >
          Compress Audio
        </button>

        {loading ? (
          <p style={{ color: "#007bff", marginTop: "10px" }}>
            Proses kompresi sedang berlangsung...
          </p>
        ) : (
          <>
            {compressedFile && (
              <>
                <audio
                  controls
                  src={URL.createObjectURL(compressedFile)}
                  style={{ marginTop: "20px" }}
                />
                <a
                  href={URL.createObjectURL(compressedFile)}
                  download="compressed_audio.mp3"
                  className="py-2 px-6 bg-green-300 rounded-md mt-4"
                >
                  Download Compressed Audio
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
