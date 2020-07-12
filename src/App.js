import React from 'react';
import ReactDOM from 'react-dom';
import {Upload, message, Button, Card, Col, Row, Spin, Input, Radio, Select} from 'antd';
import {InboxOutlined, DownloadOutlined} from '@ant-design/icons';
import axios from 'axios';
import G6 from '@antv/g6';
import 'antd/dist/antd.css';
import './App.css';

const {Option} = Select;
const {Dragger} = Upload;
const {TextArea} = Input;

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploadFinish: false,
            loading: false,
            downloadLink: '',
            runResult: '',
            modalVisible: false,
            algType: 'edge_stream',
            algName: 'midas'
        };
        this.ref = React.createRef();
        this.graph = null;

    }

    algTypeChange = (type) => {
        this.setState({algType: type});
    }

    algNameChange = (e) => {
        this.setState({algName:  e.target.value});
    }

    refreshDragedNodePosition = (e) => {
        const model = e.item.get('model');
        model.fx = e.x;
        model.fy = e.y;
    }

    componentDidMount() {
        const {clientWidth, clientHeight} = this.ref.current;
        if (!this.graph) {
            this.graph = new G6.Graph({
                container: ReactDOM.findDOMNode(this.ref.current),
                width: clientWidth,
                height: clientHeight,
                modes: {
                    default: ['drag-canvas'],
                },
                layout: {
                    type: 'force',
                    preventOverlap: true,
                },
                defaultNode: {
                    size: 27,
                    color: '#5B8FF9',
                    style: {
                        lineWidth: 2,
                        fill: '#C6E5FF',
                    },
                },
                defaultEdge: {
                    size: 1,
                    color: 'rgb(222,54,54)',
                },
            });
        }

    }

    render() {
        const _this = this;

        const props = {
            name: 'file',
            accept: '.csv',
            action: 'http://localhost:5000/run',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                alg_name: _this.state.algName
            },
            showUploadList: false,
            beforeUpload(file, fileList) {
                _this.setState({
                    uploadFinish: false,
                    loading: true,
                    downloadLink: '',
                    runResult: ''
                });

            },
            onChange(info) {

                if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功`);

                    _this.setState({
                        uploadFinish: true,
                        loading: false,
                        downloadLink: 'http://localhost:5000/download/' + info.file.response.data
                    });
                    axios.get('http://localhost:5000/download/' + info.file.response.data).then(res => {
                        _this.setState({
                            runResult: res.data
                        });
                    })
                    axios.get('http://localhost:5000/result/darpa_processed_data_scores.csv').then(res => {
                        _this.graph.data(res.data);
                        _this.graph.render();
                        const forceLayout = _this.graph.get('layoutController').layoutMethod;
                        _this.graph.on('node:dragstart', function (e) {
                            _this.graph.layout()
                            _this.refreshDragedNodePosition(e);
                        });
                        _this.graph.on('node:drag', function (e) {
                            forceLayout.execute();
                            _this.refreshDragedNodePosition(e);
                        });
                        _this.graph.on('node:dragend', function (e) {
                            e.item.get('model').fx = null;
                            e.item.get('model').fy = null;
                        });
                    })

                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 上传失败`);
                }
            },
        };

        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        let radioGroup;
        if (this.state.algType === 'edge_stream') {
            radioGroup = (
                <Radio.Group defaultValue='midas' onChange={this.algNameChange}>
                    <Radio style={radioStyle} value='midas'>
                        MIDAS
                    </Radio>
                    <Radio style={radioStyle} value='sedanspot'>
                        SedanSpot
                    </Radio>
                </Radio.Group>);
        } else {
            radioGroup = (
                <Radio.Group defaultValue='aa'  onChange={this.algNameChange}>
                    <Radio style={radioStyle} value='aa'>
                        aa
                    </Radio>
                    <Radio style={radioStyle} value='bb'>
                        bb
                    </Radio>
                </Radio.Group>);
        }

        return (
            <div className="site-card-wrapper">
                <Row gutter={16}>
                    <Col span={8} offset={2}>
                        <Card title="上传图数据" bordered={false}>
                            <div>
                                <Spin spinning={this.state.loading}>
                                    <Dragger {...props}>

                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined/>
                                        </p>
                                        <p className="ant-upload-text">点击或拖动文件至此以上传图数据</p>
                                        <p className="ant-upload-hint">
                                            仅支持csv文件
                                        </p>
                                    </Dragger>
                                </Spin>
                            </div>
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card title="选择算法" bordered={false}>
                            <Row>
                                <Col span={10}>选择算法类型：</Col>
                                <Col span={14}>
                                    <Select style={{marginTop: '-10px'}} defaultValue="edge_stream" placehoder="选择算法类型"
                                            bordered={false} onChange={this.algTypeChange}>
                                        <Option value="edge_stream">动态图边异常检测</Option>
                                        <Option value="static">静态图异常检测</Option>
                                    </Select>
                                </Col>
                            </Row>

                            {radioGroup}
                        </Card>

                    </Col>
                    <Col span={8}>
                        <Card title="运行结果" bordered={false}
                              extra={
                                  <Button type="primary" icon={<DownloadOutlined/>} size="middle"
                                          href={this.state.downloadLink} disabled={!this.state.uploadFinish}
                                          loading={this.state.loading} target="_blank">
                                      下载运行结果
                                  </Button>
                              }>

                            <TextArea rows={6} value={this.state.runResult}/>
                        </Card>
                    </Col>
                </Row>
                <Row style={{marginTop: "20px"}}>
                    <Col span={20} offset={2}>
                        <Card title="可视化结果" bordered={false}>
                            <div className="site-card-wrapper">
                                <div
                                    id="viz"
                                    ref={this.ref}
                                    style={{
                                        width: "100%",
                                        height: "450px",
                                        // border: "1px solid lightgray",
                                        font: "22pt arial",
                                    }}/>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}

function App() {
    return (
        <div className="app">
            <Main/>
        </div>
    );
}

export default App;



