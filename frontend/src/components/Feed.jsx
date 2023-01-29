import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { client } from "../client";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import { feedQuery, searchQuery } from "../utils/data";

const Feed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pins, setPins] = useState(null);
  const { categoryId } = useParams();

  useEffect(() => {
    setIsLoading(true);
    if (categoryId) {
      const query = searchQuery(categoryId);

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
  }, [categoryId, pins?.length]);

  if (isLoading)
    return <Spinner message="We are adding new ideas to your feed!" />;

  if (!pins?.length) return <h2>No pins available</h2>;

  return <div>{pins && <MasonryLayout pins={pins} />}</div>;
};

export default Feed;
