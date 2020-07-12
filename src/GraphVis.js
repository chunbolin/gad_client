import React from 'react';
import NeoVis from 'neovis.js/dist/neovis.js';
import 'antd/dist/antd.css';

class GraphVis extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadFinish: false,
        };
    }

    componentDidMount() {
        const config = {
            container_id: "viz",
            server_url: "bolt://localhost:7687",
            server_user: "neo4j",
            server_password: "sorts-swims-burglaries",
            labels: {
                //"Character": "name",
                "MyNode": {
                    "caption": "id",
                    "title_properties": [
                        "name"
                    ]
                    // "size": "pagerank",

                    //"sizeCypher": "MATCH (n) WHERE id(n) = {id} MATCH (n)-[r]-() RETURN sum(r.weight) AS c"
                }
            },
            relationships: {
                "MyRel": {
                    "thickness": "score",
                    "caption": "time"
                }
            },
            initial_cypher: "MATCH (n)-[r:MyRel]->(m) RETURN n,r,m"
        };
        this.vis = new NeoVis(config);
        this.vis.render();
    }

    render() {
        return (
            <div className="site-card-wrapper">
                <div
                    id="viz"
                    style={{
                        width: "470px",
                        height: "152px",
                        // border: "1px solid lightgray",
                        font: "22pt arial",
                    }}/>
            </div>
        )
    }
}

export default GraphVis;



