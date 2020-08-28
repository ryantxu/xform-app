// Libraries
import React, { PureComponent } from "react";

// Types
import { NavModelItem, AppRootProps } from "@grafana/data";

interface Props extends AppRootProps {}

const TAB_ID_A = "A";

export class ExampleRootPage<ScreensAppSettings> extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.updateNav();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.query !== prevProps.query) {
      if (this.props.query.tab !== prevProps.query.tab) {
        this.updateNav();
      }
    }
  }

  updateNav() {
    const { path, onNavChanged, meta } = this.props;

    const tabs: NavModelItem[] = [];
    tabs.push({
      text: "Screens",
      url: path + "?tab=" + TAB_ID_A,
      id: TAB_ID_A,
      active: true
    });

    const node = {
      text: "Screens",
      img: meta.info.logos.large,
      subTitle: "distributed screen control",
      url: path,
      children: tabs
    };

    // Update the page header
    onNavChanged({
      node: node,
      main: node
    });
  }

  render() {
    const { path, query, meta } = this.props;

    return (
      <div>
        QUERY: <pre>{JSON.stringify(query)}</pre>
        <br />
        <ul>
          <li>
            <a href={path + "?x=1"}>111</a>
          </li>
          <li>
            <a href={path + "?x=AAA"}>AAA</a>
          </li>
          <li>
            <a href={path + "?x=1&y=2&y=3"}>ZZZ</a>
          </li>
        </ul>
        <pre>{JSON.stringify(meta.jsonData)}</pre>
      </div>
    );
  }
}
