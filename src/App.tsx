import { ChangeEvent, FormEvent, useState } from "react"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import Loading from "./components/Loading";

const App = () => {

  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState<string>('')
  const [preview, setPreview] = useState<string>('/no-image.png');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (file && text) {
      setIsLoading(true)
      setResult('')

      const vision = new ChatGoogleGenerativeAI({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        modelName: "gemini-pro-vision",
        maxOutputTokens: 2048,
      });

      const reader = new FileReader();
      reader.onloadend = async () => {

        const input2 = [
          new HumanMessage({
            content: [
              {
                type: "text",
                text: `${text}`,
              },
              {
                type: "image_url",
                image_url: reader.result as string,
              },
            ],
          }),
        ];

        const res2 = await vision.stream(input2);

        for await (const chunk of res2) {
          const chunkText = chunk.content;
          console.log(chunkText);

          setResult(prevResult => prevResult + chunkText);
        }

        setIsLoading(false)
        setText('')

      };
      reader.readAsDataURL(file);
    } else {
      alert('入力に漏れがあります。')
    }
  }
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-8 items-center mt-[70px]">
        <div className="col-start-3 col-span-4">
          <div className="bg-yellow-300 p-4 rounded">
            <h1 className="text-3xl font-bold mb-2">画像読み取りくん🤨</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <img src={preview} alt="" onClick={() => document.getElementById('file-input')?.click()} className="cursor-pointer" />
                <input type="file" id="file-input" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="mb-2">
                {result ? <p>{result}</p> : (isLoading ? <Loading /> : <></>)}
              </div>
              <div className="mb-2">
                <input type="text" className="w-full border border-black rounded p-2 text-2xl focus:outline-0" value={text} onChange={(e) => setText(e.target.value)} disabled={isLoading} />
              </div>
              <button className="bg-blue-500 text-white py-1 px-3 rounded" disabled={isLoading}>送信</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App