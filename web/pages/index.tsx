/**
 * Home page for the application. This page is the first page that users see
 * when they log in. It displays a welcome message and redirects the user to
 * the first server and channel they have access to, if they exist. Otherwise,
 * it displays a message prompting the user to create or join a server.
 *
 * @author Ajay Gandecha <ajay@cs.unc.edu>
 * @author Jade Keegan <jade@cs.unc.edu>
 */

import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { getServers } from "@/utils/supabase/queries/server";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigLeftDash } from "lucide-react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  // Hook into used depdencies.
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  // Attempt to load the user's servers.
  const { data: servers, isLoading: serversLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: () => getServers(supabase),
  });

  // If the servers have been loaded, redirect the user to the first server
  // and channel they have access to if able.
  useEffect(() => {
    if (servers && servers[0]) {
      router.push(`${servers[0].id}/${servers[0].channels[0].id}`);
    }
  }, [router, servers]);

  if (serversLoading) {
    <div>
      <p className="font-bold text-lg p-6">Loading...</p>
    </div>;
  }

  return (
    <div>
      <p className="font-bold text-lg p-6">Welcome!</p>
      <div className="flex flex-row gap-3 px-6 pt-2">
        <ArrowBigLeftDash />
        <p className="font-bold">
          Create or join a server on the sidebar here.
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
