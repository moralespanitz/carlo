import { Fragment, useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import OpenAI from 'openai';

function App() {
    const [apiKey, setApiKey] = useState("");

    const RetypeComponent = ({ improvedSentence }: { improvedSentence: string }) => {
        const [userInput, setUserInput] = useState('');
        const [copied, setCopied] = useState(false);

        // Function to handle the change in input
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;
            setUserInput(input);
            setCopied(false); // Reset copied state when input changes
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
                .then(() => setCopied(true))
                .catch(error => console.error('Error copying text: ', error));
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
                    onClick={() => { setApiKey(openAIKey); }}
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
        const openai = new OpenAI({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
        const handleContinueClick = async () => {
            setEnteredSentence(temporalSentence); // Save entered text
            setIsLoading(true);
            const output = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: enteredSentence }],
                // stream: true,
            });
            setIsLoading(false);
            const message = output.choices[0].message.content;
            setImprovedSentences([
                message!
            ]);
        };

        return (
            <Fragment>
                <div className="flex flex-row justify-center">
                    <h1 className="text-3xl font-normal text-white">carl<span className="text-primary">o</span></h1>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-primary text-sm">Your Sentence:</label>
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
                <h3 className="text-primary text-sm">Improved version:</h3>
                <div className="flex flex-col py-2 gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        improvedSentences.map((sentence, index) => (
                            <RetypeComponent key={index} improvedSentence={sentence} />
                        ))
                    )}
                </div>
                <div className="mt-4 mb-4 flex flex-col gap-4 items-start">
                    <button
                        className="rounded-md bg-[#181F03] px-3 py-2 border-primary border-[1.5px] text-white text-xs"
                        onClick={() => setApiKey('')}
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
