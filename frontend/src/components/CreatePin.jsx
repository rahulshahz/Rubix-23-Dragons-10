import { useState, useRef } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

import { categories } from "../utils/data";
import { client } from "../client";
import Spinner from "./Spinner";
import SpeechRecognition, { useSpeechRecognition,} from "react-speech-recognition";
import { colours } from "nodemon/lib/config/defaults";

const CreatePin = ({ user }) => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [destination, setDestination] = useState("");
  const [fields, setFields] = useState(null);
  const [category, setCategory] = useState(null);
  const [imageAsset, setImageAsset] = useState(null);
  const [isWrongImageType, setIsWrongImageType] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const input_blog = useRef(null);
  const [message1, setMessage1] = useState("");
  const { transcript, resetTranscript } = useSpeechRecognition({continuous: true});
  const [color,setcolor] = useState('black');
  const [isblack,setisblack] = useState(true);
  const navigate = useNavigate();

  const GenerateParaphrase = () => {
  
    const data = JSON.stringify({
      "language": "en",
      "strength": 3,
      "text": `${about}`,
    });
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var inp = JSON.parse(this.responseText);
        console.log(inp);
        setAbout(inp["rewrite"]);
        setisblack(!isblack);
        setcolor(isblack?'green':'black')
      }
    });
    
    xhr.open("POST", "https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/rewrite");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader("X-RapidAPI-Key", "1f5ad84762msh4e8fba1fa074160p18b18djsnd7236551e65b");
    xhr.setRequestHeader("X-RapidAPI-Host", "rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com");
    
    xhr.send(data);
  };

  function GenerateSummary() {
    input_blog.current.value = "";
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "1f5ad84762msh4e8fba1fa074160p18b18djsnd7236551e65b",
        "X-RapidAPI-Host": "gpt-summarization.p.rapidapi.com",
      },
      body: `{"text":"${about}","num_sentences":1}`,
    };
    fetch("https://gpt-summarization.p.rapidapi.com/summarize", options)
      .then((response) => response.json())
      .then((response) => (input_blog.current.value = response.summary))
      .catch((err) => console.error(err));
  }
 

  const handleChange = (event) => {
    const options = {
      method: "POST",
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '1f5ad84762msh4e8fba1fa074160p18b18djsnd7236551e65b',
        'X-RapidAPI-Host': 'jspell-checker.p.rapidapi.com'
      },
      body: `{"language":"enUS","fieldvalues":"${event.target.value}","config":{"forceUpperCase":false,"ignoreIrregularCaps":false,"ignoreFirstCaps":true,"ignoreNumbers":true,"ignoreUpper":false,"ignoreDouble":false,"ignoreWordsWithNumbers":true}}`,
    };

    fetch("https://jspell-checker.p.rapidapi.com/check", options)
      .then((response) => response.json())
      .then((response) => {
        if (response["elements"]) {
          setMessage1(
            response["elements"][0]["errors"][0]["suggestions"].toString()
          );
        } else {
          setMessage1(null);
        }
      })
      .catch((err) => console.error(err));
    setAbout(event.target.value);
  };

  const uploadImage = (e) => {
    const selectedFile = e.target.files[0];
    const imageTypes = [
      "image/png",
      "image/svg",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/tiff",
    ];

    if (imageTypes.includes(selectedFile.type)) {
      setIsWrongImageType(false);
      setIsLoading(true);
      client.assets
        .upload("image", selectedFile, {
          contentType: selectedFile.type,
          filename: selectedFile.name,
        })
        .then((document) => setImageAsset(document))
        .catch((err) => console.log("image upload error", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsWrongImageType(true);
      setIsLoading(false);
    }
  };

  const savePin = (e) => {
    e.preventDefault();

    if (title && about && destination && imageAsset._id && category) {
      const doc = {
        _type: "pin",
        title,
        about,
        destination,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
        userId: user._id,
        postedBy: {
          _type: "postedBy",
          _ref: user._id,
        },
        category,
      };

      client
        .create(doc)
        .then(() => navigate("/"))
        .catch((err) => console.log(err));

      setTitle("");
      setAbout("");
      setDestination("");
      setImageAsset(null);
      setCategory(null);
    } else {
      setFields(true);
      setTimeout(() => setFields(false), 2000);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
      {fields && (
        <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in ">
          Please add all fields.
        </p>
      )}

      <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full">
        <section className="bg-secondaryColor p-3 flex flex-0.7 w-full">
          <div className="flex flex-col items-center justify-center border-2 border-dotted border-gray-300 p-3 w-full h-420">
            {isLoading && <Spinner />}
            {isWrongImageType && <p>It&apos;s wrong file type</p>}
            {!imageAsset ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-bold text-2xl">
                      <AiOutlineCloudUpload />
                    </p>
                    <p className="text-lg">Click to upload</p>
                  </div>

                  <p className="mt-32 text-gray-400">
                    Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF or
                    TIFF less than 20MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <article className="relative h-full">
                <img
                  src={imageAsset?.url}
                  alt="uploaded-pic"
                  className="h-full w-full"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() => setImageAsset(null)}
                >
                  <MdDelete />
                </button>
              </article>
            )}
          </div>
        </section>

        <form
          className="flex flex-col flex-1 gap-6 lg:pl-5 mt-5 w-full"
          onSubmit={savePin}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
          />
          {user && (
            <article className="flex gap-2 mt-2 mb-2 items-center bg-white rounded-lg">
              <img
                src={user.image}
                alt="user-profile"
                className="w-10 h-10 rounded-full"
              />
              <p className="font-bold">{user.username}</p>
            </article>
          )}
          {/* <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write your blog"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          /> */}

          <textarea
            value={"" + (about || transcript) }
            onChange={  handleChange}
          
            placeholder="Write your blog"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
            rows="5"
            cols="3"
            style={{ resize: "vertical" , color:color}}
          ></textarea>
          <div className="flex justify-between">
          <div className="flex " >
            {/* <button onClick={SpeechRecognition.startListening } >Start🎤</button> */}
            <div className="flex justify-left items-end " style={{cursor:"pointer"}}>
             <div
              style={{ textAlign: "center" }}
              className="bg-red-500 text-white font-bold  p-2 rounded-full w-28 outline-none">
              <p onClick={SpeechRecognition.startListening}>Start🎤 </p>
             </div>
            
              {/* className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none" */}
            </div>
            <div className="flex justify-left items-end mx-3" style={{cursor:"pointer"}}>
             <div
              style={{ textAlign: "center" }}
              className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none">
              <p onClick={SpeechRecognition.stopListening}>Stop🛑 </p>
             </div>
            </div>
            {/* className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none" */}
            {/* </div>

            {"\t"}
            <button onClick={SpeechRecognition.stopListening} className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none">Stop🛑</button>
            {/* <button onClick={SpeechRecognition.resetTranscript}>Reset</button> */}
            
          </div>

          <div className="flex justify-end items-end" style={{cursor:"pointer"}}>
            <div
              style={{ textAlign: "center" }}
              className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
            >
              <p onClick={GenerateParaphrase}>Paraphrase </p>
            </div>
            {/* className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none" */}
          </div>
          </div>
          

          <h2> Suggestions: {message1}</h2>

          <div className="flex justify-end items-end mt-5" style={{cursor:"pointer"}}>
            <div
              style={{ textAlign: "center" }}
              className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none"
            >
              <p onClick={GenerateSummary}>Click here to Generate Summary </p>
            </div>

            {/* className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none" */}
          </div>
          <textarea
            ref={input_blog}
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Summary"
            rows="5"
            cols="3"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          >
          </textarea>
          <section className="flex flex-col">
            <article>
              <p className="mb-2 font-semibold text:lg sm:text-xl">
                Choose a Category
              </p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
              >
                <option value="others" className="sm:text-bg bg-white ">
                  Select Category
                </option>
                {categories.map((item) => (
                  <option
                    key={item.name}
                    value={item.name}
                    className="text-base border-0 outline-none capitalize bg-white text-black"
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </article>

            <div className="flex justify-end items-end mt-5">
              <button
                type="submit"
                className="bg-red-500 text-white font-bold p-2 rounded-full w-full outline-none"
              >
                Post
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default CreatePin;
