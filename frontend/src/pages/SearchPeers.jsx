import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import useAuthStore from '../Store/authStore';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';

const SearchPeers = () => {
    const { searchUsers } = useAuthStore();
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

    // One short muted line under the name: skills first, bio as a fallback.
    const summaryOf = (person) =>
        person.skills?.length ? person.skills.slice(0, 4).join(' · ') : person.bio;

    return (
        <div className="page-narrow">
            <header className="mb-6">
                <h1 className="page-title">Search</h1>
                <p className="page-subtitle">Find designers, developers and creators to build with.</p>
            </header>

            <div className="relative mb-6">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" strokeWidth={1.8} />
                <input
                    type="search"
                    placeholder="Search by name or username"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="input py-3 pl-11 text-base"
                    aria-label="Search people"
                    autoFocus
                />
            </div>

            {!searchQuery && searchResults.length > 0 && !isSearching && (
                <h2 className="section-title mb-2">Suggested</h2>
            )}

            {isSearching ? (
                <div className="empty">
                    <span className="spinner" />
                </div>
            ) : searchResults.length > 0 ? (
                <ul className="divide-y divide-line">
                    {searchResults.map((result) => {
                        const summary = summaryOf(result);
                        return (
                            <li key={result._id}>
                                <Link
                                    to={`/${result.username}`}
                                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-2"
                                >
                                    <Avatar src={result.avatar} name={result.name} size="md" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-fg">{result.username}</p>
                                        <p className="truncate text-sm text-muted">
                                            {result.name}
                                            {summary && <span className="text-subtle"> · {summary}</span>}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="empty">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg">
                        {searchQuery
                            ? <Search className="h-7 w-7" strokeWidth={1.5} />
                            : <Users className="h-7 w-7" strokeWidth={1.5} />}
                    </span>
                    <h3 className="empty-title">{searchQuery ? 'No results' : 'No people yet'}</h3>
                    <p className="empty-text">
                        {searchQuery
                            ? `We couldn't find anyone matching "${searchQuery}".`
                            : 'No members have joined the community yet.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchPeers;
