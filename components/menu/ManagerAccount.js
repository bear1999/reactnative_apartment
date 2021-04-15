import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Picker } from '@react-native-community/picker'; //dropdown list
import { SearchBar } from 'react-native-elements';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Ionicons from 'react-native-vector-icons/Ionicons';

class ManagerAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataAccount: [],
      dataPosition: [],
      listRefreshing: false,
      isLoading: false, //ActivityIndicator
      formSearch: {
        Position: '0', //Vị trí mặc định là Tất cả
        TimKiem: '',
        Page: '0',
      },
    }
  }
  async componentDidMount() {
    this.setState({ isLoading: true });
    await fetch(host + '/getdata/GetPosition.php', { method: 'POST' })
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          dataPosition: json,
        })
      })
      .catch(() => { return Alert.alert('', 'Không thể kết nối tới máy chủ') });
    await this._touchSearch();

  }
  _btnSearch = async () => {
    !this.state.listRefreshing ? this.setState({ isLoading: true }) : null
    await fetch(host + '/menu/ManagerAccount.php', {
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
          dataAccount: json,
          listRefreshing: false, //pull to refresh flat list
          isLoading: false, //ActivityIndicator
        })
      })
      .catch((error) => {
        console.log(error);
        return Alert.alert('', 'Không thể kết nối tới máy chủ');
      });
  }
  _loadMore = async () => {
    await fetch(host + '/menu/ManagerAccount.php', {
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
          dataAccount: this.state.dataAccount.concat(json),
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
    }, this._loadMore);
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
  _touchPicker = (Position) => {
    this.setState({
      Position:
        this.setState(previousState => ({
          formSearch: {
            ...previousState.formSearch,
            Position: Position,
            Page: 0,
          },
        })),
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
  _renderItem = ({ item }) => {
    return (
      <View style={{ padding: 2 }}>
        <TouchableOpacity onPress={() => {
          this.loadData = this.props.navigation.addListener('focus', () => {
            this._handleRefresh();
          }),
            this.props.navigation.navigate('Profile', {
              Username: item.Username,
              Sex: item.Sex,
              PhoneNumber: item.PhoneNumber,
              Email: item.Email,
              Birthday: item.Birthday,
              pathAvatar: item.pathAvatar,
              idUser: item.idUser,
              Position: item.idPosition,
              IDCard: item.IDCard,
              Disable: item.Disable
            })
        }}>
          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 5, padding: 6 }}>
            <View style={{ borderRightWidth: 0.5, borderRightColor: "#b3b3b3" }}>
              <Image
                source={{ uri: host + '/assets/avatar/' + item.pathAvatar }}
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 75 / 2,
                  margin: 10,
                }}
              />
            </View>
            <View style={{ flex: 1, flexDirection: 'column', paddingLeft: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>ID: {item.idUser}</Text>
              <Text>Họ tên: {item.Username}</Text>
              <Text>Số điện thoại: {item.PhoneNumber}</Text>
              <Text>Email: {item.Email}</Text>
              <Text>Vị trí: {item.namePosition}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
  render() {
    const { dataAccount, isLoading } = this.state;
    const { Position, TimKiem } = this.state.formSearch;
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
          <View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 4 }}>
            <Picker
              selectedValue={Position}
              style={styles.dropdownPicker}
              onValueChange={this._touchPicker}
            >
              <Picker.Item key="0" label="Tất cả" value="0" />
              {
                this.state.dataPosition.map((item, index) =>
                  <Picker.Item key={item.idPosition} label={item.namePosition} value={item.idPosition} />
                )
              }
            </Picker>
          </View>
        </View>
        {isLoading ? <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" color="#1a8cff" /></View> :
          <FlatList
            data={dataAccount}
            renderItem={this._renderItem}
            keyExtractor={item => item.idUser.toString()}
            refreshing={this.state.listRefreshing}
            onRefresh={this._handleRefresh}
            onEndReached={this._handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropdownPicker: {
    width: "100%",
    height: 35,
  }
});

export default ManagerAccount;