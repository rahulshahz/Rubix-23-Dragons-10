import { useState, useEffect } from "react";

import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { client } from "../client";
import { feedQuery, searchQuery } from "../utils/data";

const Search = ({ searchTerm }) => {
  const [pins, setPins] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setIsLoading(true);
      const query = searchQuery(searchTerm.toLowerCase());
      client
        .fetch(query)
        .then((data) => setPins(data))
        .catch((err) => console.log(err))
        .finally(() => setIsLoading(false));
    } else {
      client
        .fetch(feedQuery)
        .then((data) => setPins(data))
        .catch((err) => console.log(err))
        .finally(() => setIsLoading(false));
    }
  }, [searchTerm]);

  return (
    <div>
      {isLoading && <Spinner message="Searching for pins" />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} />}
      {!pins?.length && searchTerm && !isLoading && (
        <div className="mt-10 text-center text-xl">No Pins Found!</div>
      )}
    </div>
  );
};

export default Search;
