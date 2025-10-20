import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, ArrowRight, Share2, Github, MessageCircle, Moon, Sun, Instagram, Copy, Check } from 'lucide-react';

const mythsData = [
  {
    id: 1,
    statement: "<b> and <strong> are the same element.",
    correct: false,
    explanation: "<strong> adds semantic importance for screen readers and search engines, while <b> is purely visual styling without semantic meaning.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong"
  },
  {
    id: 2,
    statement: "<i> and <em> both just italicize text.",
    correct: false,
    explanation: "<em> gives emphasis that's recognized by assistive technologies, while <i> is visual-only italicization without semantic weight.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em"
  },
  {
    id: 3,
    statement: "You can skip the alt attribute on images.",
    correct: false,
    explanation: "Always include alt, even if empty (alt=\"\") for decorative images. It's essential for accessibility and helps screen readers understand your content.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img"
  },
  {
    id: 4,
    statement: "<div> is fine for all structure.",
    correct: false,
    explanation: "Use semantic elements like <header>, <main>, <nav>, <section>, and <article> to give meaning to your structure and improve accessibility.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element"
  },
  {
    id: 5,
    statement: "CSS classes are better than inline styles for maintainability.",
    correct: true,
    explanation: "Correct! CSS classes separate presentation from content, making your code easier to maintain, update, and reuse across multiple elements.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style"
  },
  {
    id: 6,
    statement: "Multiple <br> tags are the right way to add spacing.",
    correct: false,
    explanation: "Use CSS margins or padding for spacing. <br> should only be used for actual line breaks within content, like in addresses or poetry.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br"
  },
  {
    id: 7,
    statement: "<!DOCTYPE html> is required for standards mode.",
    correct: true,
    explanation: "Correct! The DOCTYPE declaration triggers standards mode in browsers, ensuring consistent rendering across different browsers.",
    link: "https://developer.mozilla.org/en-US/docs/Glossary/Doctype"
  },
  {
    id: 8,
    statement: "The <center> tag is valid HTML.",
    correct: false,
    explanation: "<center> has been deprecated since HTML 4. Use CSS (text-align: center or flexbox/grid) for centering content instead.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element#obsolete_and_deprecated_elements"
  },
  {
    id: 9,
    statement: "<meta charset> is optional.",
    correct: false,
    explanation: "<meta charset=\"UTF-8\"> ensures correct character rendering and prevents encoding issues, especially with international characters.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta"
  },
  {
    id: 10,
    statement: "Void elements like <img> don't need a closing slash in HTML5.",
    correct: true,
    explanation: "Correct! In HTML5, void elements don't require a closing slash. While <img /> is valid, <img> works just fine.",
    link: "https://developer.mozilla.org/en-US/docs/Glossary/Void_element"
  },
  {
    id: 11,
    statement: "HTML5 allows multiple <h1> elements per page.",
    correct: true,
    explanation: "Correct! HTML5 allows multiple <h1> elements, especially within different sectioning elements like <article> or <section>.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements"
  },
  {
    id: 12,
    statement: "Tags must be lowercase.",
    correct: false,
    explanation: "HTML is case-insensitive, so <DIV> and <div> work the same. However, lowercase is the convention and recommended best practice.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML"
  },
  {
    id: 13,
    statement: "<script> should always be in the <head>.",
    correct: false,
    explanation: "Place scripts at the end of <body> or use the defer attribute to avoid blocking page rendering and improve performance.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script"
  },
  {
    id: 14,
    statement: "In HTML5, <a> elements can wrap block-level content.",
    correct: true,
    explanation: "Correct! HTML5 allows anchor elements to wrap block-level content, making entire cards or sections clickable.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a"
  },
  {
    id: 15,
    statement: "HTML comments improve SEO.",
    correct: false,
    explanation: "HTML comments are completely ignored by browsers and search engine crawlers. They won't help or hurt your SEO.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML/Comment_tags"
  }
];

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function HTMLMythsQuiz() {
  const [stage, setStage] = useState('intro'); // intro, quiz, outro
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [myths, setMyths] = useState([]);
  const canvasRef = useRef(null);

  // Track analytics events
  const trackEvent = (eventName, properties = {}) => {
    // Vercel Analytics tracking
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventName, properties);
    }
    console.log('Analytics Event:', eventName, properties);
  };

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Update localStorage when dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const score = answers.filter((a, i) => a === myths[i]?.correct).length;

  const handleAnswer = (userAnswer) => {
    if (revealed || animating) return;
    
    setAnimating(true);
    setAnswers([...answers, userAnswer]);
    setRevealed(true);
    setAnimating(false);
    
    const isCorrect = userAnswer === myths[currentIndex].correct;
    trackEvent('answer_submitted', {
      mythId: myths[currentIndex].id,
      userAnswer,
      correct: isCorrect,
      questionNumber: currentIndex + 1
    });
  };

  const nextCard = () => {
    if (animating) return;
    
    setAnimating(true);
    setTimeout(() => {
      setRevealed(false);
      if (currentIndex < myths.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const totalQuestions = myths.length;
        const finalScore = answers.filter((a, i) => a === myths[i]?.correct).length;
        setStage('outro');
        trackEvent('quiz_completed', {
          score: finalScore,
          totalQuestions: totalQuestions,
          percentage: Math.round((finalScore / totalQuestions) * 100)
        });
      }
      setAnimating(false);
    }, 300);
  };

  const startQuiz = () => {
    setMyths(shuffleArray(mythsData)); // Shuffle myths at start
    setStage('quiz');
    setCurrentIndex(0);
    setAnswers([]);
    setRevealed(false);
    trackEvent('quiz_started');
  };

  const restartQuiz = () => {
    setStage('intro');
    setCurrentIndex(0);
    setAnswers([]);
    setRevealed(false);
    setMyths([]);
    trackEvent('quiz_restarted');
  };

  // Generate share text
  const getShareText = () => {
    const totalQuestions = myths.length || 15;
    const percentage = Math.round((score / totalQuestions) * 100);
    return `I scored ${score}/${totalQuestions} (${percentage}%) on the "Unlearning HTML Myths" quiz at MDN x MozFest! 🧩 Can you beat my score?`;
  };

  // Copy text to clipboard
  const copyToClipboard = (text, platform) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(platform);
      trackEvent('share_text_copied', { platform });
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  // Generate Instagram Story Image
  const generateInstagramStory = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#ea580c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Load and draw logos
    const mdnLogo = new Image();
    const mozfestLogo = new Image();
    let loadedImages = 0;

    const drawContent = () => {
      // Draw MDN logo
      const mdnWidth = 200;
      const mdnHeight = (mdnLogo.height / mdnLogo.width) * mdnWidth;
      ctx.drawImage(mdnLogo, 300, 100, mdnWidth, mdnHeight);

      // Draw "×" between logos
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('×', 540, 140);

      // Draw MozFest logo
      const mozfestWidth = 200;
      const mozfestHeight = (mozfestLogo.height / mozfestLogo.width) * mozfestWidth;
      ctx.drawImage(mozfestLogo, 580, 100, mozfestWidth, mozfestHeight);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🧩 Unlearning HTML Myths', 540, 350);

      // Event info
      ctx.font = '42px Arial';
      ctx.fillText('MDN x MozFest 2025', 540, 430);

      // Score circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(540, 850, 250, 0, Math.PI * 2);
      ctx.fill();

      // Score text
      const totalQuestions = myths.length || 15;
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 120px Arial';
      ctx.fillText(`${score}/${totalQuestions}`, 540, 900);

      // Percentage
      const percentage = Math.round((score / totalQuestions) * 100);
      ctx.font = 'bold 72px Arial';
      ctx.fillText(`${percentage}%`, 540, 1000);

      // Call to action
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.fillText('Can you beat my score?', 540, 1450);

      // MDN branding
      ctx.font = '36px Arial';
      ctx.fillText('developer.mozilla.org', 540, 1750);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'html-myths-quiz-score.png';
        a.click();
        URL.revokeObjectURL(url);
        trackEvent('instagram_story_generated', { score, percentage });
      });
    };

    const onImageLoad = () => {
      loadedImages++;
      if (loadedImages === 2) {
        drawContent();
      }
    };

    mdnLogo.onload = onImageLoad;
    mozfestLogo.onload = onImageLoad;
    
    // Fallback if images don't load
    mdnLogo.onerror = () => {
      loadedImages++;
      if (loadedImages === 2) drawContent();
    };
    mozfestLogo.onerror = () => {
      loadedImages++;
      if (loadedImages === 2) drawContent();
    };

    mdnLogo.src = '/mdn-logo.svg';
    mozfestLogo.src = '/mozfest-logo.svg';
  };

  // Intro Stage
  if (stage === 'intro') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-orange-50'} flex items-center justify-center p-4 transition-colors duration-300`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            trackEvent('dark_mode_toggled', { enabled: !darkMode });
          }}
          className={`fixed top-4 right-4 p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-gray-700'} shadow-lg hover:scale-110 transition-all z-50`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <div className={`max-w-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 md:p-12 transition-colors duration-300`}>
          {/* Logo Space */}
          <div className="flex justify-center items-center gap-8 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <img 
                src="/mdn-logo.svg" 
                alt="MDN Web Docs" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className={`w-32 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg hidden items-center justify-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                MDN Logo
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-400">×</div>
            <div className="text-center">
              <img 
                src="/mozfest-logo.svg" 
                alt="MozFest" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className={`w-32 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg hidden items-center justify-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                MozFest Logo
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Unlearning HTML Myths
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              7-9 Nov, 2025 • Barcelona, Spain 🇪🇸
            </p>
            
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-6 mb-8 text-left transition-colors duration-300`}>
              <h2 className={`text-2xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'} mb-4`}>How it works:</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">1️⃣</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>You'll see 15 statements about HTML (randomly ordered)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">2️⃣</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Guess if each statement is true or false</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">3️⃣</span>
                  <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Learn the truth and discover best practices</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Stage
  if (stage === 'quiz') {
    // Safety check
    if (!myths.length || !myths[currentIndex]) {
      return null;
    }
    
    const currentMyth = myths[currentIndex];
    const userAnswer = answers[currentIndex];
    const isCorrect = userAnswer === currentMyth.correct;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-orange-50'} flex items-center justify-center p-4 transition-colors duration-300`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            trackEvent('dark_mode_toggled', { enabled: !darkMode });
          }}
          className={`fixed top-4 right-4 p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-gray-700'} shadow-lg hover:scale-110 transition-all z-50`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <div className="max-w-2xl w-full">
          {/* Logo Space */}
          <div className="flex justify-center items-center gap-6 mb-4">
            <div className="text-center">
              <img 
                src="/mdn-logo.svg" 
                alt="MDN Web Docs" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="text-xl font-bold text-gray-400">×</div>
            <div className="text-center">
              <img 
                src="/mozfest-logo.svg" 
                alt="MozFest" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Question {currentIndex + 1} of {myths.length}
              </span>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Score: {score}/{answers.length}
              </span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div
                className="bg-gradient-to-r from-blue-600 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / myths.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 md:p-10 transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Statement */}
            <div className="mb-8">
              <div className={`inline-block ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} px-4 py-2 rounded-lg text-sm font-mono mb-4`}>
                Myth #{currentMyth.id}
              </div>
              <p className={`text-2xl md:text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
                {currentMyth.statement}
              </p>
            </div>

            {/* Buttons or Reveal */}
            {!revealed ? (
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  ✓ True
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  ✗ False
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Feedback */}
                <div className={`p-4 rounded-xl ${isCorrect ? (darkMode ? 'bg-green-900 border-2 border-green-600' : 'bg-green-50 border-2 border-green-200') : (darkMode ? 'bg-red-900 border-2 border-red-600' : 'bg-red-50 border-2 border-red-200')}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`font-bold ${darkMode ? 'text-green-200' : 'text-green-900'} text-lg`}>Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <span className={`font-bold ${darkMode ? 'text-red-200' : 'text-red-900'} text-lg`}>Not quite</span>
                      </>
                    )}
                  </div>
                  <p className={darkMode ? 'text-gray-200' : 'text-gray-700'}>
                    The answer is <strong>{currentMyth.correct ? 'True' : 'False'}</strong>
                  </p>
                </div>

                {/* Explanation */}
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-5 rounded-xl`}>
                  <h3 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>Explanation:</h3>
                  <p className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>{currentMyth.explanation}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <a
                    href={currentMyth.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('mdn_link_clicked', { mythId: currentMyth.id })}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all"
                  >
                    📚 Learn More on MDN
                  </a>
                  <button
                    onClick={nextCard}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Outro Stage
  if (stage === 'outro') {
    const totalQuestions = myths.length || 15;
    const percentage = Math.round((score / totalQuestions) * 100);
    const shareText = getShareText();
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-orange-50'} flex items-center justify-center p-4 transition-colors duration-300`}>
        {/* Dark Mode Toggle */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            trackEvent('dark_mode_toggled', { enabled: !darkMode });
          }}
          className={`fixed top-4 right-4 p-3 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-gray-700'} shadow-lg hover:scale-110 transition-all z-50`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>

        <div className={`max-w-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 md:p-12 transition-colors duration-300`}>
          {/* Logo Space */}
          <div className="flex justify-center items-center gap-8 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <img 
                src="/mdn-logo.svg" 
                alt="MDN Web Docs" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className={`w-32 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg hidden items-center justify-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                MDN Logo
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-400">×</div>
            <div className="text-center">
              <img 
                src="/mozfest-logo.svg" 
                alt="MozFest" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className={`w-32 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg hidden items-center justify-center text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                MozFest Logo
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              🎉 Quiz Complete!
            </h1>
            
            {/* Score */}
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-2xl p-8 mb-8">
              <div className="text-6xl font-bold mb-2">{score}/{totalQuestions}</div>
              <div className="text-2xl">{percentage}% Correct</div>
            </div>

            <div className="space-y-6 text-left mb-8">
              {/* Keep Learning */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-6`}>
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'} mb-3`}>📖 Keep Learning</h2>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
                  Dive deeper into web development with the MDN Web Docs Curriculum
                </p>
                <a
                  href="https://developer.mozilla.org/en-US/curriculum/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('curriculum_clicked')}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Explore MDN Curriculum →
                </a>
              </div>

              {/* Contribute */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-orange-50'} rounded-xl p-6`}>
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-900'} mb-3`}>🤝 Join the Community</h2>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
                  Help make the web better by contributing to MDN
                </p>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="https://github.com/mdn"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('github_clicked')}
                    className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    <Github className="w-5 h-5" /> GitHub
                  </a>
                  <a
                    href="https://mdn.dev/discord"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('discord_clicked')}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5" /> Discord
                  </a>
                </div>
              </div>

              {/* Share */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-6`}>
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center gap-2`}>
                  <Share2 className="w-6 h-6" /> Share Your Results
                </h2>
                <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>
                  Challenge your friends to unlearn HTML myths!
                </p>
                
                {/* Instagram Story */}
                <div className="mb-4">
                  <button
                    onClick={generateInstagramStory}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Instagram className="w-5 h-5" /> Download Instagram Story Image
                  </button>
                </div>

                {/* Social Media Logos */}
                <div className="mb-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                    Share on your favorite platform:
                  </p>
                  <div className="flex justify-center gap-4 mb-4">
                    {/* X/Twitter */}
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    
                    {/* Mastodon */}
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
                      </svg>
                    </div>
                    
                    {/* Bluesky */}
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
                      </svg>
                    </div>
                    
                    {/* Threads */}
                    <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-900'} rounded-full flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.742-1.75-.501-.569-1.253-.859-2.233-.859-1.31 0-2.272.537-2.914 1.627l-1.8-.859C10.716 5.08 12.333 4 14.585 4c1.553 0 2.788.542 3.668 1.609 1.017 1.232 1.545 3.013 1.545 5.242v.093c.003.031.007.062.01.093.745.385 1.328.925 1.737 1.6.916 1.513.978 3.432-.114 5.705-.966 2.01-2.793 3.34-5.45 3.975-1.031.246-2.124.369-3.248.37l-.034-.002Z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Copy Share Text Button */}
                <button
                  onClick={() => {
                    copyToClipboard(shareText + '\n\n' + shareUrl, 'share');
                  }}
                  className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2`}
                >
                  {copiedText === 'share' ? (
                    <>
                      <Check className="w-5 h-5" /> Text Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" /> Copy Share Text
                    </>
                  )}
                </button>

                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-3 text-center`}>
                  Copy the text and paste it on your favorite platform
                </p>
              </div>
            </div>

            <button
              onClick={restartQuiz}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}