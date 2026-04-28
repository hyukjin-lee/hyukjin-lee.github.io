import * as React from "react";

const HtmlPreview = React.forwardRef<
  HTMLDivElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>((props, ref) => {
  return <div ref={ref} {...props} />;
});

HtmlPreview.displayName = "HtmlPreview";

export default HtmlPreview;
