import React, { useState, useEffect } from 'react';
import './App.css';

interface Question {
  id: string;
  text: string;
  category: string;
}

interface Source {
  documentName: string;
  excerpt: string;
  confidence: string;
}

interface ApiResponse {
  answer: string;
  sources: Source[];
}

const API_BASE_URL = 'https://x2js8lvrfk.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [sampleQuestions, setSampleQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSampleQuestions();
  }, []);

  const fetchSampleQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sample-questions`);
      const data = await response.json();
      setSampleQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching sample questions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestionClick = (questionText: string) => {
    setQuestion(questionText);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RAG Implementation - Document Q&A</h1>
        <p>Ask questions about SaaS Architecture Fundamentals</p>
      </header>

      <main className="main-content">
        <div className="question-section">
          <h2>Ask a Question</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question about SaaS architecture..."
              rows={4}
              cols={80}
              disabled={loading}
            />
            <br />
            <button type="submit" disabled={loading || !question.trim()}>
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </form>
        </div>

        <div className="sample-questions">
          <h2>Sample Questions</h2>
          <div className="questions-grid">
            {sampleQuestions.map((q) => (
              <button
                key={q.id}
                className="sample-question-btn"
                onClick={() => handleSampleQuestionClick(q.text)}
                disabled={loading}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {answer && (
          <div className="answer-section">
            <h2>Answer</h2>
            <div className="answer-content">
              <p>{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className="sources">
                <h3>Sources</h3>
                {sources.map((source, index) => (
                  <div key={index} className="source-item">
                    <h4>{source.documentName}</h4>
                    <p>{source.excerpt}</p>
                    <span className="confidence">Confidence: {source.confidence}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
