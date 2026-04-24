import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, CheckCircle2, BarChart2 } from 'lucide-react';

export default function LivePollingPage() {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [votedPolls, setVotedPolls] = useState({});

    const canManage = ['Admin', 'Trainer'].includes(user.role);

    useEffect(() => {
        if (!user) return;
        const s = io('http://localhost:3005');
        setSocket(s);

        s.on('connect', () => s.emit('register', user.id));

        s.on('active_polls', (activePolls) => {
            setPolls(activePolls.sort((a, b) => b.id - a.id));
        });

        s.on('new_poll', (poll) => {
            setPolls(prev => [poll, ...prev]);
        });

        s.on('poll_updated', (updatedPoll) => {
            setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
        });

        return () => s.disconnect();
    }, [user]);

    const handleCreatePoll = (e) => {
        e.preventDefault();
        if (!question || options.some(o => !o.trim())) return alert('Fill all fields');
        if (socket) {
            socket.emit('create_poll', { question, options });
            setQuestion('');
            setOptions(['', '']);
        }
    };

    const handleVote = (pollId, optionId) => {
        if (!socket) return;
        
        const currentVote = votedPolls[pollId];
        
        if (currentVote === optionId) {
            // Unvote
            socket.emit('submit_vote', { pollId, optionId, isUnvote: true });
            const newVotes = { ...votedPolls };
            delete newVotes[pollId];
            setVotedPolls(newVotes);
        } else {
            // Change Vote or New Vote
            socket.emit('submit_vote', { pollId, optionId, previousOptionId: currentVote });
            setVotedPolls(prev => ({ ...prev, [pollId]: optionId }));
        }
    };

    const addOption = () => setOptions(prev => [...prev, '']);
    const updateOption = (index, val) => {
        const newOpts = [...options];
        newOpts[index] = val;
        setOptions(newOpts);
    };

    const getTotalVotes = (poll) => poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
        <div className="pb-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary-600" />
                        Live Polling & Q&A
                    </h1>
                    <p className="text-surface-500 mt-1">Real-time interactive polling during training sessions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Poll Creation (Trainer/Admin) */}
                {canManage && (
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary-600" /> Create New Poll
                            </h3>
                            <form onSubmit={handleCreatePoll} className="space-y-4">
                                <div>
                                    <label className="label">Question</label>
                                    <textarea 
                                        className="input-field min-h-[80px]" 
                                        placeholder="e.g. How confident are you with React?"
                                        value={question}
                                        onChange={e => setQuestion(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="label">Options</label>
                                    {options.map((opt, idx) => (
                                        <input 
                                            key={idx}
                                            className="input-field" 
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={e => updateOption(idx, e.target.value)}
                                            required
                                        />
                                    ))}
                                    {options.length < 5 && (
                                        <button type="button" onClick={addOption} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                            <Plus className="w-4 h-4" /> Add Option
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className="btn-primary w-full mt-4">Broadcast Poll</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Active Polls Feed */}
                <div className={canManage ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
                    <AnimatePresence>
                        {polls.length === 0 ? (
                            <div className="glass-panel p-12 text-center text-surface-500 rounded-2xl flex flex-col items-center">
                                <BarChart2 className="w-12 h-12 mb-3 text-surface-400 opacity-50" />
                                <p>No active polls at the moment.</p>
                                <p className="text-sm mt-1">Waiting for the trainer to start a poll...</p>
                            </div>
                        ) : polls.map((poll) => {
                            const totalVotes = getTotalVotes(poll);
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={poll.id} 
                                    className="glass-panel p-6 rounded-2xl"
                                >
                                    <h3 className="text-xl font-bold text-surface-900 mb-4">{poll.question}</h3>
                                    
                                    <div className="space-y-3">
                                        {poll.options.map((opt) => {
                                            const percent = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                                            const hasVotedThis = votedPolls[poll.id] === opt.id;
                                            return (
                                                <div key={opt.id} className="relative">
                                                    {/* Progress Bar Background */}
                                                    <div 
                                                        className="absolute inset-0 bg-primary-500/10 rounded-xl transition-all duration-1000 ease-out"
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                    
                                                    {/* Option Button / Display */}
                                                    <button 
                                                        onClick={() => handleVote(poll.id, opt.id)}
                                                        disabled={canManage}
                                                        className={`relative w-full text-left px-4 py-3 rounded-xl border flex justify-between items-center transition-all ${
                                                            hasVotedThis ? 'border-primary-500 ring-1 ring-primary-500' : 'border-surface-200 hover:border-primary-300'
                                                        } ${canManage ? 'cursor-default' : 'cursor-pointer'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {hasVotedThis && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                                                            <span className={hasVotedThis ? 'font-bold text-primary-700' : 'font-medium text-surface-700'}>
                                                                {opt.text}
                                                            </span>
                                                        </div>
                                                        {(votedPolls[poll.id] || canManage) && (
                                                            <span className="text-sm font-bold text-surface-600">{percent}% ({opt.votes})</span>
                                                        )}
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        {totalVotes} total votes
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
