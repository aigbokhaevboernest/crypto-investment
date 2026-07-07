import "./PageLoader.css";

interface PageLoaderProps {
  hide?: boolean;
}

export const PageLoader = ({ hide = false }: PageLoaderProps) => (
  <div className={`page-loader${hide ? " hide" : ""}`}>
    <div className="loader" />
  </div>
);
