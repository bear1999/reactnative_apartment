import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Picker } from '@react-native-community/picker'; //dropdown list
import { SearchBar } from 'react-native-elements';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NumberFormat from 'react-number-format';
import AsyncStorage from '@react-native-community/async-storage';

export function Currency({ value }) {
  return (
    <NumberFormat
      value={value}
      displayType={'text'}
      thousandSeparator={true}
      suffix={' đ'}
      renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
    />
  );
}

class ListService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flagTouch: false,
      dataService: [],
      listRefreshing: false,
      isLoading: false, //ActivityIndicator
      Position: '0',
      idType_service: '',
      typeService: [{ idType: 0, nameType: 'Không hệ số' }, { idType: 1, nameType: 'Có hệ số' }],
      formSearch: {
        TimKiem: '',
        Page: '0',
        HeSo: '-1',
      },
    }
  }
  async componentDidMount() {
    this.setState({ isLoading: true });
    await AsyncStorage.getItem('@Position_Acc', (err, result) => {
      this.setState({ Position: result });
    });
    await this._touchSearch();
  }
  _confirmButton = async (item) => {
    await this.setState({ idType_service: item });
    Alert.alert("", "Bạn có chắc muốn xóa ?",
      [
        {
          text: "Có", onPress: () => this._remove()
        },
        {
          text: "Hủy",
          onPress: () => console.log("Hủy"),
          style: "cancel"
        },
      ],
      { cancelable: false }
    );
  }
  _btnSearch = async () => {
    !this.state.listRefreshing ? this.setState({ isLoading: true }) : null
    await fetch(host + '/service/ListService.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.formSearch)
    })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          dataService: json,
          listRefreshing: false, //pull to refresh flat list
          isLoading: false, //ActivityIndicator
        })
      })
      .catch((error) => {
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  _remove = async () => {
    await fetch(host + '/service/DeleteTypeService.php', {
      method: "DELETE",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idType_service: this.state.idType_service })
    })
      .then((response) => response.json())
      .then((json) => {
        if (JSON.stringify(json) == 1) {
          Alert.alert('', 'Xóa thành công');
          return this._handleRefresh();
        }
        else Alert.alert('', 'Xóa thất bại');
      })
      .catch((error) => {
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  _loadMore = async () => {
    await fetch(host + '/service/ListService.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.formSearch)
    })
      .then((response) => response.json())
      .then((json) => {
        setTimeout(() => {
          this.setState({
            dataService: this.state.dataService.concat(json),
          })
        }, 100)
      })
      .catch((error) => {
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  _handleLoadMore = () => {
    this.setState({
      Page:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            Page: this.state.formSearch.Page + 1,
          }
        }))
    }, this._loadMore)
  }
  _handleRefresh = () => { //refresh flatlist
    this.setState({
      listRefreshing: true,
      Page:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            Page: 0
          }
        }))
    }, this._btnSearch)
  }
  _touchSearch = async () => {
    this.setState({
      Page:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            Page: 0,
          },
        })),
    }, this._btnSearch)
  }
  _touchPicker = (HeSo) => {
    this.setState({
      HeSo:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            HeSo: HeSo,
            Page: 0,
          },
        })),
    }, this._btnSearch)
  }
  _renderItem = ({ item, index }) => {
    return (
      <View style={{ padding: 2 }}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
          <View style={{ justifyContent: "center", borderRightWidth: 0.5, paddingRight: 6, borderRightColor: "#999999" }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("DetailService", {
              name_service: item.name_service,
              description_service: item.description_service,
              unit: item.unit,
              price_service: item.price_service,
              type: item.type,
              imageTypeService: item.imageTypeService
            })}>
              <Image
                source={{ uri: host + '/assets/logoService/' + item.imageTypeService }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 6 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("DetailService", {
              name_service: item.name_service,
              description_service: item.description_service,
              unit: item.unit,
              price_service: item.price_service,
              type: item.type,
              imageTypeService: item.imageTypeService
            })}>
              <Text style={{ fontWeight: 'bold' }}>ID: {item.idType_service}</Text>
              <Text>Tên dịch vụ: {item.name_service}</Text>
              {item.unit ? <Text>Đơn vị: {item.unit}</Text> : null}
              <Text>Giá dịch vụ:</Text>
              <Currency value={item.price_service} />
              <Text>Hệ số: {item.type ? <Text> Có hệ số</Text> : <Text> Không hệ số</Text>}</Text>
            </TouchableOpacity>
          </View>
          {this.state.Position == 4 ?
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <View style={{ justifyContent: "center" }}>
                <TouchableOpacity onPress={() => {
                  this.refreshData = this.props.navigation.addListener('focus', () => {
                    this._handleRefresh();
                  }),
                    this.props.navigation.navigate('EditService', {
                      idType_service: item.idType_service,
                      name_service: item.name_service,
                      description_service: item.description_service,
                      unit: item.unit,
                      price_service: item.price_service,
                      type: item.type,
                      imageTypeService: item.imageTypeService
                    })
                }
                }>
                  <Text style={styles.btn1}><FontAwesome color="#fff" name="edit" size={14} /> Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>
              <View style={{ paddingLeft: 10 }}></View>
              <View style={{ justifyContent: "center" }}>
                <TouchableOpacity onPress={() => this._confirmButton(item.idType_service)}>
                  <Text style={styles.btn2}><FontAwesome color="#fff" name="remove" size={15} /> Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
            : null}
        </View>
      </View >
    );
  }
  render() {
    const { dataService, isLoading } = this.state;
    const { TimKiem, HeSo } = this.state.formSearch;
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', backgroundColor: 'rgb(20,185,200)', padding: 5 }}>
          <TouchableOpacity onPress={this.props.navigation.goBack}>
            <Ionicons color="#404040" name="chevron-back-sharp" size={35} style={{ paddingTop: 4 }} />
          </TouchableOpacity>
          <SearchBar
            placeholder="Tìm kiếm"
            onChangeText={TimKiem =>
              this.setState(previousState => ({
                formSearch: {
                  ...previousState.formSearch,
                  TimKiem
                }
              }))
            }
            onSubmitEditing={this._touchSearch}
            value={TimKiem}
            platform="android"
            containerStyle={{
              height: 45,
              borderRadius: 5,
              flex: 1,
              width: '100%',
            }}
            inputContainerStyle={{
              height: 30,
            }}
            inputStyle={{
              height: 45,
              fontSize: 18,
            }}
          />
          <TouchableOpacity onPress={this._touchSearch}>
            <Text style={{ padding: 12, color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Tìm</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingTop: 10, padding: 5 }}>
          <Text style={{ fontWeight: "bold", fontSize: 13, paddingBottom: 3, paddingLeft: 2 }}>LOẠI HỆ SỐ</Text>
          <View style={{ paddingTop: 3 }}></View>
          <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
            <Picker
              selectedValue={HeSo}
              style={styles.dropdownPicker}
              onValueChange={this._touchPicker}
            >
              <Picker.Item key="-1" label="Tất cả" value="-1" />
              {
                this.state.typeService.map((item) =>
                  <Picker.Item key={item.idType} label={item.nameType} value={item.idType} />
                )
              }
            </Picker>
          </View>
        </View>
        {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
          <>
            <View style={{ paddingTop: 5 }}></View>
            <FlatList
              data={dataService}
              renderItem={this._renderItem}
              keyExtractor={item => item.idType_service.toString()}
              refreshing={this.state.listRefreshing}
              onRefresh={this._handleRefresh}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          </>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff6666',
    padding: 8,
    borderRadius: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  dropdownPicker: {
    width: "100%",
    height: 35,
  },
  btn1: {
    backgroundColor: "#3399ff",
    color: "#fff",
    width: "100%",
    textAlign: "center",
    borderRadius: 3,
    padding: 5,
    fontWeight: "bold",
  },
  btn2: {
    backgroundColor: "#ff4d4d",
    color: "#fff",
    width: "100%",
    textAlign: "center",
    borderRadius: 3,
    padding: 5,
    fontWeight: "bold",
  },
});

export default ListService;