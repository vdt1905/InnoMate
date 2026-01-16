import React, { useState } from 'react';
import { Search, User, ArrowRight } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';

const SearchPeers = () => {
    const { searchUsers } = useAuthStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch default users on mount
    React.useEffect(() => {
        const fetchDefaultUsers = async () => {
            setIsSearching(true);
            const results = await searchUsers('');
            setSearchResults(results);
            setIsSearching(false);
        };
        fetchDefaultUsers();
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounce could be added here, but for now:
        setIsSearching(true);
        const results = await searchUsers(query);
        setSearchResults(results);
        setIsSearching(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Find Peers</h1>
                    <p className="text-gray-400">Discover designers, developers, and creators to collaborate with</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-14 pr-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-lg shadow-lg"
                            />
                        </div>
                    </div>

                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400">Searching specifically for you...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {searchResults.map((result) => (
                                <div
                                    key={result._id}
                                    onClick={() => {
                                        navigate(`/${result.username}`);
                                    }}
                                    className="group flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-105 transition-transform duration-300">
                                        {result.name?.charAt(0) || <User />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-200 truncate">
                                            {result.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm truncate">@{result.username}</p>
                                        {result.bio && (
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{result.bio}</p>
                                        )}
                                    </div>
                                    <div className="p-2 bg-gray-700/30 rounded-xl group-hover:bg-purple-500/20 transition-colors duration-200">
                                        {/* <span className="text-2xl">👉</span> */}
                                        <ArrowRight />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No peers found</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                {searchQuery ? `We couldn't find anyone matching "${searchQuery}"` : "No members found in the community yet."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPeers;
