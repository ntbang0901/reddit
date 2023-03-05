import { useRouter } from "next/router";
import CreateOrEditPost from "../components/CreateAndEditPost";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const initialValues: CreatePostInput = {
  title: "",
  text: "",
  image: "",
};

const CreatePost = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();

  const [createPost, {}] = useCreatePostMutation();
  const router = useRouter();

  const onCreatePostSubmit = async (values: CreatePostInput) => {
    await createPost({
      variables: {
        createPostInput: values,
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            posts(existing) {
              if (data?.createPost.success && data.createPost.post) {
                // Post:new_id
                const newPostRef = cache.identify(data.createPost.post);

                const newPostsAfterCreation = {
                  ...existing,
                  totalCount: existing.totalCount + 1,
                  paginatedPosts: [
                    { __ref: newPostRef },
                    ...existing.paginatedPosts, // [{__ref: 'Post:1'}, {__ref: 'Post:2'}]
                  ],
                };

                return newPostsAfterCreation;
              }
            },
          },
        });
      },
    });

    router.push("/");
  };

  if (authLoading || (!authLoading && !authData?.me)) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <CreateOrEditPost
        onSubmit={onCreatePostSubmit}
        initialValues={initialValues}
        labelButton="Create Post"
      />
    </Layout>
  );
};

export default CreatePost;
