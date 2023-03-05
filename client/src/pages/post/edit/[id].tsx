import { useRouter } from "next/router";
import AlertStatus from "../../../components/AlertStatus";
import CreateOrEditPost from "../../../components/CreateAndEditPost";
import Layout from "../../../components/Layout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";

const PostEdit = () => {
  const router = useRouter();

  const userId = router.query.id as string;

  const { data: meData, loading: meLoading } = useMeQuery();

  const { data: postData, loading } = usePostQuery({
    variables: { id: userId },
  });

  const initialValues: Omit<UpdatePostInput, "id"> = {
    title: postData?.post?.title as string,
    text: postData?.post?.text as string,
    image: postData?.post?.image as string,
  };

  const [updatePost, _] = useUpdatePostMutation();

  const onEditPostSubmit = async (values: Omit<UpdatePostInput, "id">) => {
    await updatePost({
      variables: {
        updatePostInput: {
          id: userId,
          ...values,
        },
      },
    });

    router.push(`/post/${postData?.post?.id}`);
  };

  if (loading || meLoading) return <LoadingSpinner />;

  if (!postData?.post)
    return <AlertStatus status="error" message="Post not found" />;

  if (meData?.me?.id.toString() !== postData?.post?.userId.toString())
    return <AlertStatus status="error" message="Unauthorized" />;

  return (
    <Layout>
      <CreateOrEditPost
        initialValues={initialValues}
        onSubmit={onEditPostSubmit}
        labelButton={"Update Post"}
      />
    </Layout>
  );
};

export default PostEdit;
