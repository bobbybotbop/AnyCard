import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError() as any;

    return (
        <div id='error-page' className="min-h-screen bg-gradient-to-b from-blue-400 to-white p-8 flex flex-col items-center justify-center">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
};

export default ErrorPage;
