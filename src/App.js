import * as React from "react";

const useSemiPersistentState = (key, initialState) => {
	const [value, setValue] = React.useState(
		localStorage.getItem(key) ?? initialState
	);

	React.useEffect(() => {
		localStorage.setItem(key, value);
	}, [value, key]);

	return [value, setValue];
};

const initialStories = [
	{
		title: "React",
		url: "https://reactjs.org/",
		author: "Jordan Walke",
		num_comments: 3,
		points: 4,
		objectID: 0,
	},
	{
		title: "Redux",
		url: "https://redux.js.org/",
		author: "Dan Abramov, Andrew Clark",
		num_comments: 2,
		points: 5,
		objectID: 1,
	},
];

const getAsyncStories = () =>
	new Promise((resolve) =>
		setTimeout(() => resolve({ data: { stories: initialStories } }), 2000)
	);

const storiesReducer = (state, action) => {
	switch (action.type) {
		case "SET_STORIES":
			return action.payload;
		case "REMOVE_STORY":
			return state.filter(
				(story) => action.payload.objectID !== story.objectID
			);
		default:
			throw new Error();
	}
};

const App = () => {
	console.log("App renders");
	const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
	const [stories, dispatchStories] = React.useReducer(storiesReducer, []);
	const [isLoading, setIsLoading] = React.useState(false);
	const [isError, setIsError] = React.useState(false);

	React.useEffect(() => {
		setIsLoading(true);
		getAsyncStories()
			.then((result) => {
				dispatchStories({
					type: "SET_STORIES",
					payload: result.data.stories,
				});
				setIsLoading(false);
			})
			.catch(setIsError(true));
	}, []);

	const handleRemoveStory = (item) => {
		dispatchStories({
			type: "REMOVE_STORY",
			payload: item,
		});
	};

	const handleSearch = (event) => {
		setSearchTerm(event.target.value);
	};

	const searchedStories = stories.filter((story) =>
		story.title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<>
			<h1>My Hacker Stories</h1>
			<InputWithLabel
				id="search"
				value={searchTerm}
				onInputChange={handleSearch}
				isFocused
			>
				<strong>Search: </strong>
			</InputWithLabel>
			<hr />
			{isError && <p>Something went wrong..</p>}
			{isLoading ? (
				<p>Loading...</p>
			) : (
				<List list={searchedStories} onRemoveItem={handleRemoveStory} />
			)}
			;
		</>
	);
};

const List = ({ list, onRemoveItem }) => (
	<ul>
		{list.map((item) => (
			<Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
		))}
	</ul>
);

const Item = ({ item, onRemoveItem }) => {
	return (
		<li>
			<span>
				<a href={item.url}>{item.title}</a>
			</span>
			<span>{item.author}</span>
			<span>{item.num_comments}</span>
			<span>{item.points}</span>
			<span>
				<button type="button" onClick={() => onRemoveItem(item)}>
					Dismiss
				</button>
			</span>
		</li>
	);
};

const InputWithLabel = ({
	id,
	value,
	type = "text",
	onInputChange,
	children,
	isFocused,
}) => {
	console.log("Search renders");

	const inputRef = React.useRef();

	React.useEffect(() => {
		if (isFocused && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isFocused]);

	return (
		<>
			<label htmlFor={id}>{children}</label>
			&nbsp;
			<input
				ref={inputRef}
				id={id}
				type={type}
				value={value}
				onChange={onInputChange}
				autoFocus={isFocused}
			/>
		</>
	);
};

export default App;
