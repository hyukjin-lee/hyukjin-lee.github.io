import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface Props {
  target: string;
}

const LegacyRedirect = ({ target }: Props) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <meta httpEquiv="refresh" content={`0;url=${target}`} />
      </Head>
      <p>Redirecting to {target}</p>
    </>
  );
};

export default LegacyRedirect;
