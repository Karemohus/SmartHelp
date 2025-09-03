
import React from 'react';
import { ViolationRule, ToastMessage } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ViolationRulesEditorProps {
    violationRules: ViolationRule[];
    setViolationRules: React.Dispatch<React.SetStateAction<ViolationRule[]>>;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const ViolationRulesEditor: React.FC<ViolationRulesEditorProps> = ({ violationRules, setViolationRules, addToast }) => {
    const { t } = useLanguage();
    const handleRuleChange = (ruleId: string, field: keyof ViolationRule, value: any) => {
        setViolationRules(prevRules => 
            prevRules.map(rule => 
                rule.id === ruleId ? { ...rule, [field]: value } : rule
            )
        );
    };

    const handleSave = () => {
        addToast('Violation rules updated successfully!', 'success');
        // The state is already updated on change, this button is for user feedback.
    };

    const getRuleTitle = (type: ViolationRule['type']) => {
        switch (type) {
            case 'speeding': return 'Speeding Violation';
            case 'missed_maintenance': return 'Missed Maintenance Violation';
            default: return 'Unknown Rule';
        }
    };
     const getRuleDescription = (type: ViolationRule['type']) => {
        switch (type) {
            case 'speeding': return 'Automatically creates a violation when a driver\'s speed exceeds the specified limit.';
            case 'missed_maintenance': return 'Automatically creates a violation if a vehicle passes its scheduled maintenance date.';
            default: return '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800">Violation Rules</h3>
            <p className="text-sm text-slate-600 mt-1 mb-6">
                Configure rules to automatically generate violations based on driver and vehicle activity.
            </p>

            <div className="space-y-6">
                {violationRules.map(rule => (
                    <div key={rule.id} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-slate-800">{getRuleTitle(rule.type)}</h4>
                                <p className="text-xs text-slate-500">{getRuleDescription(rule.type)}</p>
                            </div>
                            <label htmlFor={`toggle-${rule.id}`} className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id={`toggle-${rule.id}`} className="sr-only" checked={rule.isEnabled} onChange={(e) => handleRuleChange(rule.id, 'isEnabled', e.target.checked)} />
                                    <div className={`block w-10 h-6 rounded-full transition ${rule.isEnabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <div className={`dot absolute start-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${rule.isEnabled ? 'transform translate-x-4' : ''}`}></div>
                                </div>
                                <div className="ms-2 text-sm font-medium text-slate-600">{rule.isEnabled ? t('active') : t('inactive')}</div>
                            </label>
                        </div>
                        
                        {rule.isEnabled && (
                            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                {rule.type === 'speeding' && (
                                     <div>
                                        <label htmlFor={`threshold-${rule.id}`} className="block text-xs font-medium text-slate-700 mb-1">Speed Limit (km/h)</label>
                                        <input
                                            id={`threshold-${rule.id}`}
                                            type="number"
                                            value={rule.threshold}
                                            onChange={(e) => handleRuleChange(rule.id, 'threshold', parseInt(e.target.value, 10))}
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                        />
                                    </div>
                                )}
                                 {rule.type === 'missed_maintenance' && (
                                     <div className="text-sm text-slate-600 p-2 italic flex items-center h-full">
                                        This rule has no configurable threshold.
                                    </div>
                                )}

                                <div>
                                    <label htmlFor={`fine-${rule.id}`} className="block text-xs font-medium text-slate-700 mb-1">Fine Amount ($)</label>
                                    <input
                                        id={`fine-${rule.id}`}
                                        type="number"
                                        value={rule.fineAmount}
                                        onChange={(e) => handleRuleChange(rule.id, 'fineAmount', parseInt(e.target.value, 10))}
                                        className="w-full p-2 border border-slate-300 rounded-md"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
             <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    {t('save_changes')}
                </button>
            </div>
        </div>
    );
};

export default ViolationRulesEditor;