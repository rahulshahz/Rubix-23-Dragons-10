import { useState, useEffect } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { client, urlFor } from "../client";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";
import Sentiment from "sentiment";

const PinDetail = ({ user }) => {
  const { pinId } = useParams();
  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const [sentimentScore, setSentimentScore] = useState(null);

  // const user_comment = (comment1) => {
  //   console.log(comment1);
  // };

  const fetchPinDetails = () => {
    const query = pinDetailQuery(pinId);

    if (query) {
      // fetching single pin details
      client.fetch(`${query}`).then((data) => {
        setPinDetail(data[0]);

        // fetching similar pins
        if (data[0]) {
          const query2 = pinDetailMorePinQuery(data[0]);
          client.fetch(query2).then((resp) => setPins(resp));
        }
      });
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId, pinDetail?.comments]);

  const addComment = () => {
    if (comment) {
      setIsAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [
          {
            comment,
            _key: uuid(),
            postedBy: { _type: "postedBy", _ref: user._id },
          },
        ])
        .commit()
        .then(() => {
          setComment("");
          setTimeout(() => {
            fetchPinDetails();
          }, 2000);
        })
        .catch((err) => console.log(err))
        .finally(() => setIsAddingComment(false));
    }
  };

  if (!pinDetail) {
    return <Spinner message="Showing pin" />;
  }

  return (
    <>
      {pinDetail && (
        <div
          className="flex xl:flex-row flex-col m-auto bg-white"
          style={{ maxWidth: "1500px", borderRadius: "32px" }}
        >
          <figure className="flex justify-center items-center md:items-start flex-initial">
            <img
              src={pinDetail?.image && urlFor(pinDetail?.image).url()}
              alt="pin-pic"
              className="rounded-t-3xl rounded-b-lg"
            />
          </figure>

          <div className="w-full p-5 flex-1 xl:min-w-620">
            <section className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <a
                  href={`${pinDetail.image.asset.url}?dl=`}
                  download
                  className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                >
                  <MdDownloadForOffline />
                </a>
              </div>

    
            </section>

            <section>
              <h1 className="text-4xl font-bold break-words mt-3">
                {pinDetail.title}
              </h1>
              <p className="mt-3">{pinDetail.about}</p>
            </section>

            <Link
              to={`/user-profile/${pinDetail?.postedBy._id}`}
              className="flex gap-2 mt-5 items-center bg-white rounded-lg"
            >
              <img
                src={pinDetail?.postedBy.image}
                alt="user"
                className="w-10 h-10 rounded-full"
              />
              <p className="font-bold">{pinDetail?.postedBy.username}</p>
            </Link>

            <h2 className="mt-5 text-2xl">Comments</h2>

            <section className="max-h-370 overflow-y-auto">
              {pinDetail?.comments?.map((item) => (
                <div
                  key={item._key}
                  className="flex gap-2 mt-5 items-center bg-white rounded-lg"
                >
                  <img
                    src={item.postedBy.image}
                    alt="user-profile"
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold">{item.postedBy?.username}</p>
                    <p>{item.comment}</p>
                    <p className="text-sm italic">
                      {new Sentiment().analyze(item.comment).score >= 0
                        ? "(Positive)✅"
                        : "(Negative)❌"}
                    </p>

                    {/* <div>{user_comment(item.comment)}</div> */}
                  </div>
                </div>
              ))}
            </section>

            <section className="flex flex-wrap mt-6 gap-3">
              <Link to={`/user-profile/${user?._id}`}>
                <img
                  src={user?.image}
                  alt="user-profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                />
              </Link>
              <input
                type="text"
                className="flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="button"
                onClick={addComment}
                className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
              >
                {isAddingComment ? "Posting.." : "Post"}
              </button>
            </section>
          </div>
        </div>
      )}
      {pins?.length !== 0 && (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {pins ? (
        <MasonryLayout pins={pins} />
      ) : (
        <Spinner message="Loading more pins..." />
      )}
    </>
  );
};

export default PinDetail;
