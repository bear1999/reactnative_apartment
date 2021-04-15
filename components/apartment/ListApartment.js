import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Picker } from '@react-native-community/picker'; //dropdown list
import { SearchBar } from 'react-native-elements';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';

class ListApartment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flagTouch: false,
      dataApartment: [],
      dataStatus: [],
      dataTypeApartment: [],
      listRefreshing: false,
      isLoading: false, //ActivityIndicator
      idMain: null,
      Position: '0',
      formSearch: {
        idType_apartment: '1', //Tòa nhà là 1
        TimKiem: '',
        idStatus: '0',
        Page: '0',
      },
    }
  }
  async componentDidMount() {
    this.setState({ isLoading: true });
    await AsyncStorage.getItem('@Position_Acc', (err, result) => {
      this.setState({ Position: result });
    });
    await fetch(host + '/getdata/GetTypeApartment.php', { method: 'GET' })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          dataTypeApartment: json,
        })
      })
      .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
    await fetch(host + '/getdata/GetStatus.php', { method: 'GET' })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          dataStatus: json,
        })
      })
      .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
    await this._loadDataDefault();
  }
  _confirmButton = async (item) => {
    await this.setState({ idMain: item });
    Alert.alert("", "Bạn có chắc muốn xóa ?",
      [
        {
          text: "Có", onPress: () => this._remove()
        },
        {
          text: "Hủy",
          style: "cancel"
        },
      ],
      { cancelable: false }
    );
  }
  _loadDataDefault = async () => {
    await fetch(host + '/apartment/ListApartment.php', {
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
          dataApartment: json,
          isLoading: false,
        })
      })
      .catch(() => { null });
  }
  _btnSearch = async () => {
    if (this.state.flagTouch) {
      !this.state.listRefreshing ? this.setState({ isLoading: true }) : null
      await fetch(host + '/apartment/ListApartment.php', {
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
            dataApartment: json,
            listRefreshing: false, //pull to refresh flat list
            isLoading: false, //ActivityIndicator
          })
        })
        .catch((error) => {
          console.log(error);
          return Alert.alert('', 'Không thể kết nối tới máy chủ');
        });
    }
  }
  _remove = async () => {
    await fetch(host + '/apartment/DeleteApartment.php', {
      method: "DELETE",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idMain: this.state.idMain })
    })
      .then((response) => response.json())
      .then((json) => {
        if (JSON.stringify(json) == 1) {
          Alert.alert('', 'Xóa thành công');
          this._handleRefresh();
        }
        else Alert.alert('', 'Xóa thất bại');
      })
      .catch((error) => {
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  _loadMore = async () => {
    await fetch(host + '/apartment/ListApartment.php', {
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
          dataApartment: this.state.dataApartment.concat(json),
        })
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
  _touchPicker = (idType_apartment) => {
    this.setState({
      idType_apartment:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            idType_apartment: idType_apartment,
            Page: 0,
          },
        })),
    }, this._btnSearch);
    setTimeout(() => { this.setState({ flagTouch: true }) }, 1); // 1 ms
  }
  _pickerStatus = (idStatus) => {
    this.setState({
      idStatus:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            idStatus: idStatus,
            Page: 0,
          },
        })),
    }, this._btnSearch);
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
  _renderItem = ({ item }) => {
    let Go = "Apartment";
    if (this.state.formSearch.idType_apartment == 4) Go = "InfoApartment";
    return (
      <View style={{ padding: 2 }}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate(Go, {
            idMain: item.idMain,
            currentType: this.state.formSearch.idType_apartment,
            nameTitle: item.name_apartment,
          })}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <Text style={{ fontWeight: 'bold' }}>ID: {item.idMain}</Text>
              <Text>Tên: {item.name_apartment}</Text>
              <Text>Trạng thái: {item.name_status}</Text>
              <Text>Loại: {item.name_type_apartment}</Text>
            </View>
          </TouchableOpacity>
          {this.state.Position == 4 ?
            <View style={{ flexDirection: "row", justifyContent: "flex-end", flex: 1 }}>
              <View style={{ justifyContent: "center" }}>
                <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate('EditApartment', {
                    currentType: item.type_apartment,
                    currentStatus: item.idStatus,
                    idMain: item.idMain,
                    Tittle: item.name_apartment
                  });
                  this.loadData = this.props.navigation.addListener('focus', () => {
                    this._handleRefresh();
                  });
                }}>
                  <Text style={styles.btn1}><FontAwesome color="#fff" name="edit" size={14} /> Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>
              <View style={{ paddingLeft: 10 }}></View>
              <View style={{ justifyContent: "center" }}>
                <TouchableOpacity onPress={() => this._confirmButton(item.idMain)}>
                  <Text style={styles.btn2}><FontAwesome color="#fff" name="remove" size={15} /> Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
            : null
          }
        </View>
      </View>
    );
  }
  render() {
    const { dataApartment, isLoading } = this.state;
    const { idType_apartment, TimKiem, idStatus } = this.state.formSearch;
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
        {this.state.Position == 4 ?
          <TouchableOpacity onPress={() => {
            this.props.navigation.navigate('AddApartment', { currentType: this.state.formSearch.idType_apartment });
            this.loadData = this.props.navigation.addListener('focus', () => {
              this._handleRefresh();
            });
          }}>
            <View style={{ padding: 8 }}>
              <Text style={styles.button}> <FontAwesome color="#fff" name="plus-circle" size={15} /> Thêm</Text>
            </View>
          </TouchableOpacity>
          : null
        }
        <View style={{ paddingLeft: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>TRẠNG THÁI</Text>
        </View>
        <View style={{ paddingTop: 5, padding: 5 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
            <Picker
              selectedValue={idStatus}
              style={styles.dropdownPicker}
              onValueChange={this._pickerStatus}
            >
              <Picker.Item key="0" label="Tất cả" value="0" />
              {
                this.state.dataStatus.map((item, index) =>
                  <Picker.Item key={item.idStatus} label={item.name_status} value={item.idStatus} />
                )
              }
            </Picker>
          </View>
        </View>
        <View style={{ paddingLeft: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>LOẠI</Text>
        </View>
        <View style={{ paddingTop: 5, padding: 5 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
            <Picker
              selectedValue={idType_apartment}
              style={styles.dropdownPicker}
              onValueChange={this._touchPicker}
            >
              {
                this.state.dataTypeApartment.map((item, index) =>
                  <Picker.Item key={item.idType_apartment} label={item.name_type_apartment} value={item.idType_apartment} />
                )
              }
            </Picker>
          </View>
        </View>
        {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
          <>
            <View style={{ paddingTop: 5 }}></View>
            <FlatList
              data={dataApartment}
              renderItem={this._renderItem}
              keyExtractor={item => item.idMain.toString()}
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

export default ListApartment;