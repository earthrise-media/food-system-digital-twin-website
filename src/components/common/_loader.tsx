import ContentLoader from "react-content-loader";

interface LineLoaderProps {
  width?: number;
  height?: number;
}

export default function LineLoader(
  { width = 100, height = 10 }: LineLoaderProps = {}
) {
  return (
    <ContentLoader
      speed={2}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      backgroundColor="var(--background-2)"
      foregroundColor="var(--background-3)"
    >
      <rect x="0" y="2" rx="3" ry="3" width={width - 2} height={height -2} />
    </ContentLoader>
  );
}
