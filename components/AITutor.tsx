import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { Message, MessageSender, TutorMode, SubMode, CareerSubModes } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { SendIcon } from './icons/SendIcon';
import ModeSelector from './ModeSelector';
import { HistoryIcon } from './icons/HistoryIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

const getModeConfig = (mode: TutorMode, subMode: SubMode | null) => {
    switch (mode) {
        case 'Exam':
            return {
                systemInstruction: `You are an AI Exam Simulator for African student nurses. Your goal is to help them prepare for written exams. First, ask the user what topic they want to be quizzed on. If the user isn't sure or doesn't specify a topic, you MUST suggest a list of common, high-yield topics, for example: 'Pharmacology,' 'Infection Control,' and 'Maternal Health'. Once they provide a topic, generate one relevant question at a time (multiple choice, true/false, or short answer). After the user answers, tell them if they are correct or not, provide a detailed explanation for the correct answer, and then ask if they are ready for the next question. Maintain a supportive and encouraging tone.`,
                welcomeMessage: 'Welcome to the Exam Simulator! What topic would you like to be quizzed on today?'
            };
        case 'OSCE':
            return {
                systemInstruction: `You are an expert AI OSCE Simulator designed for African student nurses, focusing on **${subMode || 'general'}** nursing. Your primary role is to create realistic, multi-stage clinical scenarios for practice. You will act as a patient, family member, or an examiner.

**Your Core Directives:**

1.  **Initiate the Session:** Start by welcoming the user. Ask what kind of scenario they'd like to practice. If they are unsure, suggest common OSCE stations relevant to **${subMode || 'general'}** nursing.

2.  **Present a Multi-Stage Scenario:** Create a detailed, dynamic scenario that can evolve over several interactions.

3.  **Respond in Character:** Maintain your assigned role consistently.

4.  **Provide Detailed Feedback:** After EACH user response, provide structured feedback in a separate section enclosed in triple square brackets.

    [[[
    **Clinical Reasoning:** [Evaluate their thought process against best practices for the **${subMode || 'general'}** context.]
    **Communication Skills:** [Assess their empathy and clarity. Provide specific examples, e.g., "Using the question 'How are you feeling?' was good. To improve, you could try a reflective statement like 'It sounds like this has been difficult.'"]
    **Procedural Steps:** [Comment on the correctness of their described procedures. If their description is vague or misses a key action, instead of just pointing out the omission, **ask a clarifying question to prompt them**. For example: "You mentioned you would prepare the medication. Can you walk me through the specific checks you would perform right before administering it?"].
    **Suggestion for Improvement:** [Provide one concrete, actionable tip.]
    ]]]
    This feedback is crucial for their learning.

5.  **Maintain Safety:** Do not provide prescriptive medical advice. Frame all guidance as educational and for simulation purposes only.`,
                welcomeMessage: `Welcome to the advanced OSCE Simulator for **${subMode || 'General'}** Nursing! What kind of station would you like to practice today?`
            };
        case 'NCLEX':
            return {
                systemInstruction: `You are an AI NCLEX exam tutor. Your purpose is to provide realistic NCLEX-style questions. First, ask the user for a topic. If they are unsure or don't specify one, you MUST suggest a few high-yield NCLEX categories, for example: 'Management of Care,' 'Pharmacological and Parenteral Therapies,' and 'Safety and Infection Control'. Present one question at a time. After they answer, provide the correct answer and a detailed rationale explaining why it's correct and why the other options are incorrect.`,
                welcomeMessage: `Welcome to the NCLEX Simulator! What nursing topic would you like to practice today?`
            };
        case 'OET':
            return {
                systemInstruction: `You are an AI tutor specializing in the Occupational English Test (OET) for nurses. Ask the user which sub-test they'd like to practice (Listening, Reading, Writing, Speaking).
- **For Speaking**, act as an interlocutor in a role-play scenario.
- **For Writing**, provide a case note and ask the user to write a referral letter.
- **Provide Granular Feedback:** For writing and speaking, you MUST provide highly detailed, granular critiques. Break down feedback into sections: **Grammar**, **Vocabulary Choice**, and **Task Achievement**. For speaking, add a **Pronunciation** section, offering theoretical advice on common challenges with words the user typed. **Crucially, every piece of feedback MUST be illustrated with specific examples quoted directly from the user's response.** For example: "In your sentence, 'he is pain', the grammar could be improved. A better structure is 'he is *in* pain'. For vocabulary, instead of 'pain', a more clinical term like 'discomfort' or 'soreness' could be more precise."`,
                welcomeMessage: `Hello! Ready to practice for the OET? Which sub-test would you like to work on: Listening, Reading, Writing, or Speaking?`
            };
        case 'IELTS':
            return {
                systemInstruction: `You are an AI tutor for the IELTS exam, tailored for nursing professionals. Ask the user which module they want to practice (Listening, Reading, Writing, Speaking).
- **For Speaking**, act as an examiner, asking typical IELTS questions.
- **For Writing**, present a Task 1 (describing a graph/chart) or Task 2 (essay) prompt.
- **Provide Granular Feedback:** For writing and speaking, you MUST provide highly detailed, granular critiques. Break down feedback into sections: **Task Achievement**, **Coherence and Cohesion**, **Lexical Resource**, and **Grammatical Range and Accuracy**. For speaking, add a **Pronunciation** section, offering theoretical advice on common challenges with words the user typed. **Crucially, every piece of feedback MUST be illustrated with specific examples quoted directly from the user's response.** For example: "For Lexical Resource, you wrote 'the graph shows a good increase'. To use a higher-level vocabulary, you could say 'the graph illustrates a *significant* increase' or a '*substantial* rise'."`,
                welcomeMessage: `Welcome to IELTS preparation for nurses. Which module are we practicing today: Listening, Reading, Writing, or Speaking?`
            };
        case 'NMC_CBT':
            return {
                systemInstruction: `You are an AI simulator for the UK's NMC Computer Based Test (CBT) for **${subMode || 'Adult'}** nurses. Your goal is to familiarize students with the format and content of the CBT exam. Ask the user if they're ready to start. Then, provide one question at a time, based on UK nursing standards and protocols. Questions should be multiple-choice. After the user answers, reveal the correct answer and provide a clear rationale based on NMC guidelines. The topic for this session is **${subMode || 'Adult'}** nursing.`,
                welcomeMessage: `Welcome to the NMC CBT Simulator for **${subMode || 'Adult'}** Nursing. Let's test your knowledge of UK standards. Are you ready for your first question?`
            };
        case 'Jobs':
            return {
                systemInstruction: `You are an AI Nursing Job Assistant. Your task is to help users find nursing jobs. Ask the user for their desired nursing role (e.g., Registered Nurse, Nurse Practitioner, Nurse Educator, Clinical Nurse Specialist), specialty, location (city/country), and years of experience. Use your search tool to find relevant job listings. Present the jobs in a clear, numbered list format, including the job title, hospital/clinic, location, and a brief summary. Crucially, after presenting the text, you MUST list all the source websites you used under a 'Sources:' heading. Do not invent jobs; use real-time search information.`,
                welcomeMessage: `Welcome to the Nursing Job Finder! Tell me what you're looking for (e.g., role, specialty, city/country).`,
                tools: [{googleSearch: {}}]
            };
        case 'Career':
             if (subMode === 'Resume Builder') {
                return {
                    systemInstruction: `You are a world-renowned CV expert with over 30 years of experience in UK nursing recruitment and deep expertise in Applicant Tracking Systems (ATS) used by the NHS and private healthcare firms. Your persona is that of a meticulous, strategic, and supportive career coach.

**Your MANDATORY Workflow & Output:**

1.  **Request Inputs:** First, you must ask the user for: the full **Job Description**, the full **Person Specification**, and their **current CV excerpt**. Do not proceed without these.
2.  **Analyze & Structure Output:** Once you have the inputs, you MUST structure your entire response using the following markdown format EXACTLY. Do not add any conversational text outside of this structure.

### 1. 🔍 Extracted ATS Keywords (Grouped by Category: Skills, Knowledge, Duties, Clinical Procedures, etc.)
[Here, you will list the extracted keywords and phrases from the Job Description and Person Specification. Group them logically.]

### 2. 📝 Supporting Statement (Full narrative format, covering all essential and desirable criteria from the Person Specification)
[Here, you will write a comprehensive supporting statement. This narrative must systematically address the criteria from the Person Specification (Qualifications, Experience, Skills, Knowledge, etc.), providing evidence from the user's background and integrating keywords seamlessly.]

---

### 3. 📄 **Optimised CV Draft**
[This draft will be saved to the user's browser for future sessions.]

\`\`\`markdown
# [User's Name]
[Contact Details]

## 🧠 Professional Summary
[A concise, 2–3 sentence impactful summary, weaving in top-tier keywords.]

## 💼 Key Skills
[A list of 6–8 key skills as bullet points, contextualized with keywords, e.g., "- Patient Advocacy & Safeguarding: Championed patient rights in line with Trust policies..."]

## 📊 Work Experience
**[Job Title]** | [Employer] | [Dates]
[Bulleted list of rewritten work experience. Each bullet point MUST start with a strong action verb, integrate keywords naturally, and include quantifiable metrics where possible (e.g., "Managed a daily caseload of 5-6 patients...").]
\`\`\`

**Core Principles You MUST Adhere To:**
- **ATS Optimisation:** Contextually integrate keywords.
- **Quantify Achievements:** Use numbers and data to demonstrate impact. Do not exaggerate.
- **UK/NHS Terminology & British English:** Use terms like 'MDT', 'safeguarding', 'Trust policies', 'CPD'. Proofread meticulously.
- **Avoid Bias:** Do not use language that implies age or other discriminatory factors.`,
                    welcomeMessage: `Welcome to the specialist NHS Resume Builder. To begin, please provide me with the **Job Description**, the **Person Specification**, and your **current CV excerpt** (summary and work experience). This will allow me to create a CV and supporting statement that is fully optimised for the role.`,
                };
            }
            return { // Default: General Advice
                systemInstruction: `You are an AI career and personal development coach for nurses in Africa. Your role is to provide guidance on topics like career progression, specialization, and interview preparation.
1.  **Ask Clarifying Questions:** Before offering advice, you MUST ask clarifying follow-up questions to understand the user's specific goals and challenges.
2.  **Provide Actionable Advice & Resources:** Your guidance must be supportive and actionable. When offering guidance, you MUST suggest specific resources, including links to relevant professional nursing organizations (e.g., African nursing councils, international bodies), online courses (e.g., from platforms like Coursera or edX), or articles from reputable nursing publications, tailored to the user's stated goals.`,
                welcomeMessage: `Hello! Let's talk about your nursing career. What's on your mind? We can discuss career paths, further studies, leadership, or anything else to help you grow professionally.`
            };
        case 'Tutor':
        default:
            return {
                systemInstruction: `You are an AI Tutor for African student nurses. Your goal is to explain nursing concepts clearly and concisely. You must not provide any prescriptive clinical instructions or medical advice. All your guidance should be educational and theoretical. Always encourage students to consult with their clinical instructors, supervisors, and preceptors for real-world patient care decisions. When you explain a medical concept, conclude your explanation with a section titled "**For Further Reading:**". Under this heading, suggest types of resources where students can find more information, such as specific nursing textbooks, reputable online medical databases (like WHO, Cochrane Library), or professional nursing journals. Frame your answers to be supportive, encouraging, and culturally relevant to the African context where appropriate.`,
                welcomeMessage: "Hello! I'm your AI Nursing Tutor. How can I help you with your studies today? Feel free to ask me about nursing concepts, patient care theory, or exam preparation."
            };
    }
};

const extractScenarioDetails = async (description: string): Promise<{ age: string; gender: string; chiefComplaint: string; }> => {
    try {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extract the patient's age, gender, and chief complaint from the following OSCE scenario description. If a detail is not mentioned, leave the corresponding field empty. Description: "${description}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        age: { type: Type.STRING, description: "The patient's age, e.g., '35-year-old' or 'elderly'." },
                        gender: { type: Type.STRING, description: "The patient's gender, e.g., 'male' or 'female'." },
                        chiefComplaint: { type: Type.STRING, description: "The patient's main reason for the visit or problem, e.g., 'shortness of breath' or 'abdominal pain'." },
                    },
                    required: ["age", "gender", "chiefComplaint"],
                },
            },
        });

        const jsonStr = response.text.trim();
        const details = JSON.parse(jsonStr);
        return {
            age: details.age || '',
            gender: details.gender || '',
            chiefComplaint: details.chiefComplaint || '',
        };
    } catch (error) {
        console.error("Failed to extract scenario details:", error);
        return { age: '', gender: '', chiefComplaint: '' };
    }
};


const AITutor: React.FC = () => {
  const [mode, setMode] = useState<TutorMode>('Tutor');
  const [subMode, setSubMode] = useState<SubMode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ [key: string]: string[] }>({});
  const [showHistory, setShowHistory] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyPanelRef = useRef<HTMLDivElement>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem('nurse-ai-tutor-history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    } catch (e) {
        console.error("Failed to load history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        setIsLoading(true);
        setError(null);
        setMessages([]);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const { systemInstruction, welcomeMessage, tools } = getModeConfig(mode, subMode);

        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction,
              ...(tools && { tools }),
          }
        });
        
        let initialMessage = welcomeMessage;
        if (mode === 'Career' && subMode === 'Resume Builder') {
            const draft = localStorage.getItem('nurse-resume-draft') || '';
            if (draft) {
                initialMessage = `Welcome back to the specialist NHS Resume Builder! I see you have a saved draft below. To start a new targeted application, please provide the **Job Description** and **Person Specification**. Or, you can tell me what changes you'd like to make to your existing draft.\n\n\`\`\`markdown\n${draft}\n\`\`\``;
            }
        }

        setMessages([
            {
              id: 'init',
              text: initialMessage,
              sender: MessageSender.AI
            }
        ]);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "An unknown error occurred during initialization.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [mode, subMode]);
  
  // Effect to handle clicking outside the history panel
  useEffect(() => {
    if (!showHistory) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyPanelRef.current &&
        !historyPanelRef.current.contains(event.target as Node) &&
        historyButtonRef.current &&
        !historyButtonRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHistory]);
  
  const handleModeChange = (newMode: TutorMode) => {
    if (newMode !== mode) {
        setMode(newMode);
        setSubMode(newMode === 'Career' ? CareerSubModes[0] : null);
    }
  };

  const handleSubModeChange = (newSubMode: SubMode) => {
    setSubMode(newSubMode);
  };
  
  const updateHistory = (query: string) => {
    const newHistory = { ...history };
    const modeHistory = newHistory[mode] || [];
    const updatedModeHistory = [query, ...modeHistory.filter(item => item !== query)].slice(0, 10);
    newHistory[mode] = updatedModeHistory;
    setHistory(newHistory);
    localStorage.setItem('nurse-ai-tutor-history', JSON.stringify(newHistory));
  };
  
  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        // Remove markdown for cleaner speech
        const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[[*\]_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    } else {
        setError("Sorry, your browser does not support audio playback.");
    }
  };


  const generateAndPollVideo = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1
        }
    });

    const maxPolls = 18; // 3 minutes max
    let pollCount = 0;

    while (!operation.done && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        pollCount++;
    }

    if (!operation.done) {
        throw new Error("Video generation timed out.");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } else {
        throw new Error("Failed to get video download link from operation response.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    updateHistory(input);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    // OSCE Video Generation Logic for the first user message
    if (mode === 'OSCE' && messages.length === 1) {
        const videoLoadingMessage: Message = {
            id: 'video-loading-' + Date.now(),
            text: '🎬 Generating an immersive video for your OSCE scenario... This can take a few minutes. Please wait.',
            sender: MessageSender.AI,
        };
        setMessages(prev => [...prev, videoLoadingMessage]);
        
        try {
            const scenarioDetails = await extractScenarioDetails(currentInput);
            
            let videoPrompt: string;
            const detailsArray: string[] = [];
            if (scenarioDetails.age) detailsArray.push(`a ${scenarioDetails.age} patient`);
            if (scenarioDetails.gender) detailsArray.push(scenarioDetails.gender);
            if (scenarioDetails.chiefComplaint) detailsArray.push(`presenting with ${scenarioDetails.chiefComplaint}`);
            
            if (detailsArray.length > 0) {
                videoPrompt = `A realistic, short, clinical simulation video for a nursing OSCE exam. Depict ${detailsArray.join(', ')}. The patient is in a clinical setting. Show their condition and immediate surroundings based on the chief complaint. Original user request for context: "${currentInput}"`;
            } else {
                videoPrompt = `A realistic, short, clinical simulation video for a nursing OSCE exam. The scenario is: "${currentInput}". Depict the patient and their immediate surroundings.`;
            }

            const videoUrl = await generateAndPollVideo(videoPrompt);
            
            const response = await chatRef.current.sendMessage({ message: currentInput });
            let aiText = response.text;

            if (videoUrl) {
                aiText += `\n\n---\n**Visual Aid:**\n[Click here to watch a short video of the scenario](${videoUrl})`;
            }

            const aiMessage: Message = {
                id: Date.now().toString() + '-ai',
                text: aiText,
                sender: MessageSender.AI,
            };
            
            setMessages(prev => {
                const newMessages = prev.filter(m => m.id !== videoLoadingMessage.id);
                return [...newMessages, aiMessage];
            });

        } catch (videoError) {
            console.error("Video Generation Error:", videoError);
            setError("Sorry, I couldn't generate the video. Let's proceed with a text-only simulation.");
            
            // Fallback to text-only
            const response = await chatRef.current.sendMessage({ message: currentInput });
            const aiMessage: Message = {
                id: Date.now().toString() + '-ai-fallback',
                text: response.text,
                sender: MessageSender.AI,
            };

            setMessages(prev => {
                const newMessages = prev.filter(m => m.id !== videoLoadingMessage.id);
                return [...newMessages, aiMessage];
            });
        } finally {
            setIsLoading(false);
        }
        return;
    }

    // Default message handling for other modes
    try {
      const response = await chatRef.current.sendMessage({ message: currentInput });
      let aiText = response.text;

      if (mode === 'Career' && subMode === 'Resume Builder') {
        const resumeMatch = aiText.match(/```markdown\n([\s\S]*?)\n```/);
        if (resumeMatch && resumeMatch[1]) {
            localStorage.setItem('nurse-resume-draft', resumeMatch[1].trim());
        }
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (mode === 'Jobs' && groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map((chunk: any) => `- ${chunk.web.title || 'Source'}: ${chunk.web.uri}`)
            .join('\n');
        aiText += `\n\n---\n**Sources from Google Search:**\n${sources}`;
      }
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: aiText,
        sender: MessageSender.AI,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = "Sorry, I couldn't process your request right now. Please check your connection or API key and try again.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { id: 'error-' + Date.now(), text: errorMessage, sender: MessageSender.AI },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
    const renderMessageText = (text: string) => {
        const markdownCodeBlockRegex = /```markdown\n([\s\S]*?)\n```/g;
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

        const parts = text.split(markdownCodeBlockRegex);

        return parts.map((part, index) => {
            if (index % 2 === 1) { // This is the markdown code block content
                return (
                    <pre key={index} className="bg-gray-200 p-3 rounded-lg my-2 text-sm text-gray-800 overflow-x-auto">
                        <code>{part}</code>
                    </pre>
                );
            }

            // Process this part for links
            const linkParts = part.split(linkRegex);
            return linkParts.map((linkPart, linkIndex) => {
                 if (linkIndex % 3 === 1) { // Link text
                    const url = linkParts[linkIndex + 1];
                    return (
                        <a key={`${index}-${linkIndex}`} href={url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold">
                            {linkPart}
                        </a>
                    );
                }
                if (linkIndex % 3 === 2) { return null; } // URL part, already handled
                return linkPart; // Plain text
            }).filter(Boolean);
        });
    };


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
      <ModeSelector 
        currentMode={mode} 
        currentSubMode={subMode}
        onModeChange={handleModeChange} 
        onSubModeChange={handleSubModeChange}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === MessageSender.USER ? 'justify-end' : ''
              }`}
            >
              {msg.sender === MessageSender.AI && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div
                className={`max-w-md p-4 rounded-2xl relative group ${
                  msg.sender === MessageSender.USER
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                    {msg.sender === MessageSender.AI ? renderMessageText(msg.text) : msg.text}
                </div>
                {(mode === 'OET' || mode === 'IELTS') && msg.sender === MessageSender.AI && (
                    <button 
                        onClick={() => handlePlayAudio(msg.text)} 
                        className="absolute -bottom-3 -right-3 p-1.5 rounded-full bg-white text-emerald-600 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-emerald-50"
                        aria-label="Play audio"
                    >
                        <SpeakerIcon className="w-4 h-4" />
                    </button>
                )}
              </div>
              {msg.sender === MessageSender.USER && (
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                   <UserIcon className="w-5 h-5 text-gray-600" />
                 </div>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && !messages.some(m => m.id.startsWith('video-loading')) &&(
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="max-w-md p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
       {error && <div className="p-4 text-center text-red-600 bg-red-100 border-t border-gray-200 text-sm">{error}</div>}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl relative">
        {showHistory && (history[mode]?.length > 0) && (
            <div ref={historyPanelRef} className="absolute bottom-full mb-2 left-4 right-4 bg-white border rounded-lg shadow-xl z-20">
            <p className="p-2 text-xs font-bold text-gray-500 border-b">Search History</p>
            <ul className="max-h-48 overflow-y-auto">
                {history[mode].map((item, index) => (
                <li key={index} 
                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 truncate"
                    onClick={() => { setInput(item); setShowHistory(false); }}>
                    {item}
                </li>
                ))}
            </ul>
            </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3 relative">
          {(history[mode]?.length > 0) && (
             <button
                ref={historyButtonRef}
                type="button"
                onClick={() => setShowHistory(prev => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Show search history"
            >
                <HistoryIcon className="w-5 h-5" />
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a nursing topic..."
            className="flex-1 w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 transition duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;