import { Fragment, useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import OpenAI from 'openai';

function App() {
    const [apiKey, setApiKey] = useState("");
    useEffect(() => {
        // Retrieve API key from local storage
        const storedApiKey = localStorage.getItem('apiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    })

    const RetypeComponent = ({ improvedSentence, setClipboardCopied }: {
        improvedSentence: string,
        setClipboardCopied: (copied: boolean) => void
    }) => {
        const [userInput, setUserInput] = useState('');
        const [copied, setCopied] = useState(false);

        // Function to handle the change in input
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;
            setUserInput(input);
            setCopied(false); // Reset copied state when input changes
            setClipboardCopied(false);
            console.log(copied);
        };

        // Function to handle deselection of input
        const handleBlur = () => {
            setUserInput('');
        };

        // Function to determine the color of each character
        const getCharacterClass = (index: any) => {
            if (index >= userInput.length) return 'text-gray-500'; // Not reached character
            return userInput[index] === improvedSentence[index] ? 'text-primary' : 'text-red-500'; // Correct or incorrect character
        };

        // Function to handle copying text to clipboard
        const handleCopyToClipboard = () => {
            navigator.clipboard.writeText(improvedSentence)
                .then(() => {
                    setCopied(true),
                        setClipboardCopied(true);
                })
                .catch(error => console.error('Error copying text: ', error));
            setTimeout(() => {
                setClipboardCopied(false)
            }, 3000);
        };

        useEffect(() => {
            if (userInput === improvedSentence && userInput.length === improvedSentence.length) {
                handleCopyToClipboard();
            }
        }, [userInput, improvedSentence]);

        return (
            <div className="border-primary border-[1.5px] rounded-md bg-black px-3 py-2 outline-none text-white
            relative
            ">
                <div className='flex flex-col'>
                    <div className='flex flex-wrap text-xs'>
                        {improvedSentence.split('').map((char, index) => (
                            char === ' ' ? (
                                // Use a more semantic approach for spaces to maintain layout without visual representation
                                <span key={index} className="font-play" aria-hidden="true">{'\u00A0'}</span>
                            ) : (
                                // Remove unnecessary fragment, directly return the span element
                                <span key={index} className={`${getCharacterClass(index)} font-play`}>{char}</span>
                            )
                        ))}
                    </div>
                    <input
                        className="absolute bg-transparent font-play text-transparent outline-none"

                        value={userInput}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        );
    }

    const APIKeySection = () => {
        const [openAIKey, setOpenAIKey] = useState<string>('');
        return <Fragment>
            <div className="flex flex-row justify-center">
                <h1 className="text-3xl font-normal text-white">carl<span className="text-primary">o</span></h1>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-primary text-sm">API Key:</label>
                <input
                    className="border-primary border-[1.5px] rounded-md bg-black px-3 py-2 placeholder:text-[#6B6B6B] outline-none text-white"
                    type="password"
                    placeholder="Set your OpenAI here"
                    required
                    onChange={
                        (e) => {
                            var newKey = e.target.value;
                            setOpenAIKey(newKey);
                        }
                    }
                />
            </div>
            <div className="mt-4 mb-8 flex flex-col gap-4 text-center">
                <button
                    className="rounded-md bg-[#181F03] px-3 py-2 border-primary border-[1.5px] text-white text-md"
                    onClick={() => { 
                        setApiKey(openAIKey);
                        localStorage.setItem('apiKey', openAIKey);
                     }}
                >
                    Continue
                </button>
                <h4 className="text-[#6F6F6F]">Visit moralespanitz.com</h4>
            </div>
        </Fragment>;
    }

    const SenteceSection = () => {
        const [temporalSentence, setTemporalSentence] = useState<string>("");
        const [enteredSentence, setEnteredSentence] = useState<string>(""); // New state to hold entered text
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [improvedSentences, setImprovedSentences] = useState<string[]>([]);
        const [isError, setIsError] = useState<boolean>(false);
        const [clipboardCopied, setClipboardCopied] = useState<boolean>(false);
        
        const openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
        const ENGLISH_TEACHER_PROMPT = "Please provide three suggestions to improve the following sentence (the output should be a JSON format list): ";

        const handleContinueClick = async () => {
            try {
                setEnteredSentence(temporalSentence); // Save entered text
                console.log(enteredSentence);
                setIsLoading(true);
                var content = ENGLISH_TEACHER_PROMPT + temporalSentence + "\n\n The output should be [\"Sample text for revision\",\"Another sample sentence for revision\"]";
                const output = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: content }],
                });
                setIsLoading(false);
                const message = output.choices[0].message.content;
                // Convert to json object
                if (message === "" || message === null) {
                    throw new Error("No suggestions provided");
                }
                const outputContent = JSON.parse(message);
                setImprovedSentences(outputContent);
            } catch (error) {
                setIsLoading(false);
                setIsError(true);
                setTimeout(() => {
                    setIsError(false);
                }, 3000);
            }

        };

        return (
            <Fragment>
                <div className="flex flex-row justify-center">
                    <h1 className="text-3xl font-normal text-white">carl<span className="text-primary">o</span></h1>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row justify-between items-center">
                        <label className="text-primary text-sm">Your Sentence:</label>
                        {clipboardCopied && <h4 className="bg-gray-700 text-white text-xs border-white border px-2 py-1 rounded-md">Copied</h4>}
                    </div>
                    <textarea
                        className="border-primary border-[1.5px] rounded-md bg-black px-3 py-2 placeholder:text-[#6B6B6B] outline-none text-white"
                        rows={2}
                        placeholder="Write here your sentence"
                        value={temporalSentence}
                        onChange={(e) => {
                            var newSentence = e.target.value;
                            setTemporalSentence(newSentence);
                        }}
                    />
                    <button
                        className="rounded-md bg-[#181F03] px-3 py-2 border-primary border-[1.5px] text-white text-md"
                        onClick={handleContinueClick}
                    >
                        Continue
                    </button>
                </div>

                <div className="flex flex-col py-2 gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {isError && <p className="text-red-500 border-red-500 border rounded-md px-2 py-1">An error occurred. Please try again later.</p>}
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <Fragment>
                            {improvedSentences.length > 0 && (
                                <h3 className="text-primary text-sm">Improved version:</h3>
                            )}
                            {
                                improvedSentences.map((sentence, index) => (
                                    <RetypeComponent key={index} improvedSentence={sentence} setClipboardCopied={setClipboardCopied} />
                                ))
                            }
                        </Fragment>

                    )}
                </div>
                <div className="mt-4 mb-4 flex flex-col gap-4 items-start">
                    <button
                        className="rounded-md bg-[#181F03] px-3 py-2 border-primary border-[1.5px] text-white text-xs"
                        onClick={() => {
                            setApiKey('')
                            localStorage.removeItem('apiKey')
                        }}
                    >
                        Change API Key
                    </button>
                    <div className="w-full text-center">
                        <h4 className="text-[#6F6F6F]">Visit moralespanitz.com</h4>
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <div className="w-80 bg-black flex flex-col px-10 py-2 gap-2 font-play h-full">
            {apiKey === '' ? (
                <APIKeySection />
            ) : (
                <SenteceSection />
            )}
        </div>
    );
}

export default App;
