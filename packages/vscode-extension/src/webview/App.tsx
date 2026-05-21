import React, { useState, useEffect } from 'react';
import './App.css';

interface VsCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}
declare const acquireVsCodeApi: (() => VsCodeApi) | undefined;

const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Step {
  title: string;
  checklist: ChecklistItem[];
}

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>({
    title: 'Step 1: Write a Failing Test',
    checklist: [
      { id: 'item-1', text: 'Write a test file under tests/', completed: false },
      { id: 'item-2', text: 'Verify test fails running npm test', completed: false }
    ]
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'updateState' && message.value) {
        setCurrentStep(message.value);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleItem = (itemId: string) => {
    const updatedChecklist = currentStep.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setCurrentStep({ ...currentStep, checklist: updatedChecklist });
    
    // Post event back to VS Code Extension host using single instance
    if (vscode) {
      vscode.postMessage({ type: 'onInfo', value: `Checked item: ${itemId}` });
    }
  };

  const triggerTestRun = () => {
    // Post event back to VS Code Extension host using single instance
    if (vscode) {
      vscode.postMessage({ type: 'runCommand', value: 'npm run test' });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h3>Superpowers Dashboard</h3>
        <span className="subtitle">Workflow State Tracker</span>
      </header>

      <section className="step-card">
        <h4 className="step-title">{currentStep.title}</h4>
        <div className="checklist">
          {currentStep.checklist.map(item => (
            <label key={item.id} className="checklist-item">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
              />
              <span className={item.completed ? 'completed-text' : ''}>{item.text}</span>
            </label>
          ))}
        </div>
      </section>

      <footer className="action-footer">
        <button className="btn btn-primary" onClick={triggerTestRun}>
          Run Local Test Suite
        </button>
      </footer>
    </div>
  );
}
