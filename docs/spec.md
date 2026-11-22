<img src="docs/media/image1.jpeg"
style="width:7.75in;height:10.76181in" />

**TRƯỜNG ĐẠI HỌC KỸ THUẬT CÔNG NGHỆ CẦN THƠ**

> **KHOA CÔNG NGHỆ THÔNG TIN**

-----🙞🙜🕮🙞🙜-----

<img src="docs/media/image2.png"
style="width:1.83333in;height:1.83333in" />

**BÁO CÁO HỌC PHẦN**

**ĐỒ ÁN 1**

**<u>ĐỀ TÀI:</u>**

**HỆ THỐNG QUẢN LÝ KINH DOANH NHÀ SÁCH BOOKMARK**

**Giảng viên hướng dẫn:**

**Họ Tên: TS. Lý Hồng Hải**

**Sinh viên thực hiện:**

1.  **Phạm Minh Khôi KHMT2411052**

2.  **Đinh Nguyễn Hoàng Minh KHMT2411006**

**Lớp: Khoa học máy tính 2024**

Cần Thơ, năm 2026

**LỜI CAM ĐOAN**

Chúng em xin cam đoan đồ án *‘Hệ thống quản lý kinh doanh nhà sách
BookMark’* là kết quả nghiên cứu của nhóm, được thực hiện dưới sự hướng
dẫn của TS. Lý Hồng Hải. Các nguồn tài liệu tham khảo đều được trích dẫn
rõ ràng.

Nội dung của đồ án là kết quả của quá trình nghiên cứu và tổng hợp từ
nhiều nguồn tài liệu khác nhau, không sao chép nguyên văn các đề tài hay
công trình nghiên cứu của các tác giả khác. Nhóm cam kết mọi nội dung
trong đồ án đều do các thành viên trong nhóm tự thực hiện và chịu hoàn
toàn trách nhiệm về tính chính xác cũng như tính trung thực của đề tài.

*Cần Thơ, năm 2026*

> **Sinh viên 1** **Sinh viên 2**

Phạm Minh Khôi Đinh Nguyễn Hoàng Minh

**KHÔI MINH**

**LỜI CẢM ƠN**

Lời đầu tiên, chúng em xin gửi lời cảm ơn chân thành đến quý thầy cô
Trường Đại học Kỹ thuật – Công nghệ Cần Thơ, đặc biệt là các thầy cô
Khoa Công nghệ thông tin đã tận tâm truyền đạt những kiến thức nền tảng
và chuyên ngành quý báu trong suốt thời gian chúng em theo học.

Chúng em xin bày tỏ lòng biết ơn sâu sắc đến giảng viên hướng dẫn – TS.
Lý Hồng Hải. Thầy đã luôn theo sát, định hướng và gợi mở nhiều ý tưởng
thực tế, giúp nhóm tháo gỡ các khó khăn để hoàn thành Đồ án 1 với đề tài
*“ Hệ thống quản lý kinh doanh nhà sách BookMark”*.

Quá trình thực hiện đồ án giúp chúng em tiếp cận nhiều kiến thức mới và
có cái nhìn thực tế hơn về chuyên ngành Khoa học Máy tính. Tuy nhiên, do
kinh nghiệm còn hạn chế nên bài làm khó tránh khỏi những thiếu sót.
Chúng em rất mong nhận được những đánh giá, góp ý từ quý thầy cô để rút
kinh nghiệm và hoàn thiện tốt hơn.

Chúng em xin chân thành cảm ơn!

# CHƯƠNG 1: TỔNG QUAN

## 1.1. Lý do chọn đề tài

Trong những năm gần đây, thói quen mua sắm của người tiêu dùng Việt Nam
thay đổi rõ rệt: bên cạnh việc đến cửa hàng trực tiếp, ngày càng nhiều
người tìm kiếm, so sánh giá và đặt mua qua Internet. Đối với ngành sách
và văn phòng phẩm, xu hướng này thể hiện qua sự phát triển của các nhà
sách lớn như Fahasa, vốn vận hành đồng thời hệ thống cửa hàng và kênh
bán hàng trực tuyến, kèm theo các chương trình khuyến mãi, tích điểm và
đặt trước sách mới. Điều đó đặt ra yêu cầu mới cho các nhà sách quy mô
vừa và nhỏ: không chỉ bán tốt tại quầy mà còn phải quản lý hàng hóa
chính xác và phục vụ được khách hàng trên môi trường trực tuyến.

Tuy nhiên, nhiều nhà sách vẫn quản lý theo cách thủ công hoặc dùng các
công cụ rời rạc như sổ sách, bảng tính và phần mềm bán hàng đơn lẻ. Cách
làm này dẫn đến một số hạn chế sau:

- **Tồn kho thiếu chính xác:** số liệu nhập, bán và kiểm kê được ghi ở
  nhiều nơi khác nhau nên dễ sai lệch, khó phát hiện thất thoát và thiếu
  hoặc thừa hàng.

- **Bán hàng tại quầy chậm và dễ nhầm lẫn:** việc tra cứu sản phẩm, tính
  tiền, áp dụng voucher, cộng điểm tích lũy và in hóa đơn nếu làm tay sẽ
  mất thời gian và dễ sai sót.

- **Thiếu kênh bán hàng trực tuyến:** khách hàng không thể tìm kiếm sản
  phẩm, đặt trước sách mới hoặc thanh toán từ xa, nên nhà sách bỏ lỡ một
  phần nhu cầu.

- **Khó kiểm soát nhân sự và doanh thu:** việc phân quyền theo vai trò
  và tổng hợp báo cáo doanh thu thiếu công cụ hỗ trợ nên chủ cửa hàng
  khó nắm bắt tình hình kinh doanh kịp thời.

Những hạn chế trên có chung một nguyên nhân là dữ liệu của các nghiệp vụ
không được liên kết với nhau. Vì vậy, cần một hệ thống thống nhất, trong
đó cùng một cơ sở dữ liệu phục vụ bán hàng tại quầy, bán hàng trực
tuyến, quản lý kho và báo cáo quản trị. Đây chính là lý do nhóm chọn đề
tài **" Hệ thống quản lý kinh doanh nhà sách BookMark"**.

Đề tài lấy mô hình nhà sách BookMark chuyên kinh doanh sách các thể
loại, truyện tranh và đồ dùng học tập, tham khảo cách tổ chức nghiệp vụ
của Fahasa nhưng thu gọn về quy mô phù hợp với một đồ án môn học. Việc
thực hiện đề tài còn giúp sinh viên vận dụng quy trình phát triển phần
mềm hoàn chỉnh, từ phân tích yêu cầu, mô hình hóa bằng UML, thiết kế cơ
sở dữ liệu và API cho đến xây dựng giao diện và kiểm thử. Từ lý do này,
các mục tiêu và phương pháp thực hiện được trình bày ở mục tiếp theo.

## 1.2. Mục tiêu và phương pháp nghiên cứu

### 1.2.1. Mục tiêu nghiên cứu

**Mục tiêu tổng quát:** phân tích, thiết kế và xây dựng hệ thống quản lý
nhà sách BookMark hỗ trợ đồng thời bán hàng tại quầy (POS), bán hàng
trực tuyến, quản lý kho và quản trị, nhằm giải quyết các hạn chế đã nêu
ở mục 1.1.

**Mục tiêu cụ thể:** mỗi mục tiêu dưới đây tương ứng với một nhóm chức
năng trong sơ đồ use case tổng quát (xem mục 1.3.2 và Chương 3).

1.  **Phục vụ khách hàng trực tuyến:** cho phép khách hàng đăng ký, đăng
    nhập, tìm kiếm bộ truyện và combo, thêm vào giỏ hàng, đặt trước và
    thanh toán đơn hàng trực tuyến (UC10 – UC14).

2.  **Hỗ trợ bán hàng tại quầy:** giúp nhân viên thu ngân đăng nhập POS,
    tra cứu sản phẩm, lập giỏ hàng, áp dụng voucher hoặc điểm tích lũy,
    thanh toán và in hóa đơn (UC01 – UC05).

3.  **Quản lý kho chính xác:** hỗ trợ lập phiếu nhập kho, cập nhật tồn
    kho, lập và duyệt phiếu kiểm kê (UC06 – UC09).

4.  **Hỗ trợ quản trị:** quản lý danh mục hàng hóa, tài khoản và phân
    quyền, đồng thời cung cấp báo cáo doanh thu cho quản trị viên (UC15
    – UC17).

5.  **Hoàn thiện hồ sơ phân tích thiết kế:** xây dựng đầy đủ tài liệu
    gồm đặc tả yêu cầu, sơ đồ use case, sơ đồ lớp, sơ đồ tuần tự, thiết
    kế cơ sở dữ liệu và thiết kế API làm cơ sở cho phần cài đặt.

6.  **Xây dựng sản phẩm chạy thử được:** hiện thực các chức năng chính
    bằng công nghệ web hiện đại, bảo đảm bảo mật dữ liệu và phân quyền
    theo vai trò.

### 1.2.2. Phương pháp nghiên cứu

Để đạt các mục tiêu trên, đề tài kết hợp phương pháp nghiên cứu lý
thuyết và phương pháp thực nghiệm theo trình tự sau:

**a) Phương pháp khảo sát và tham khảo.** Tìm hiểu cách tổ chức nghiệp
vụ của các nhà sách có cả kênh trực tiếp và trực tuyến, chủ yếu là
Fahasa, để xác định các quy trình cần có như bán hàng, khuyến mãi, tích
điểm, đặt trước, nhập kho và kiểm kê. Kết quả của bước này là cơ sở để
xác định danh sách actor và use case.

**b) Phương pháp phân tích thiết kế hướng đối tượng bằng UML.** Từ các
quy trình đã khảo sát, hệ thống được mô hình hóa bằng sơ đồ use case, sơ
đồ lớp và sơ đồ tuần tự. Công cụ vẽ sử dụng là PlantUML. Việc mô hình
hóa trước khi lập trình giúp thống nhất yêu cầu và giảm sai sót khi cài
đặt.

**c) Phương pháp thiết kế dữ liệu và giao tiếp.** Cơ sở dữ liệu quan hệ
được thiết kế trên PostgreSQL và truy cập thông qua Prisma ORM. Giao
tiếp giữa giao diện và máy chủ được thiết kế theo kiến trúc RESTful API.

**d) Phương pháp xây dựng và thực nghiệm.** Hệ thống được cài đặt theo
mô hình ba tầng với các công nghệ sau:

- **Giao diện (frontend):** ReactJS kết hợp Vite, React Router, Tailwind
  CSS và Ant Design.

- **Máy chủ (backend):** Node.js và Express.js, cung cấp RESTful API.

- **Cơ sở dữ liệu:** PostgreSQL, truy cập qua Prisma ORM.

- **Bảo mật:** xác thực bằng JSON Web Token (JWT), mã hóa mật khẩu bằng
  bcrypt, phân quyền theo vai trò (RBAC).

- **Thanh toán trực tuyến:** tích hợp cổng VNPay ở môi trường thử nghiệm
  (sandbox).

- **Công cụ hỗ trợ:** Visual Studio Code, Git và GitHub, Postman để kiểm
  thử API.

Sau khi cài đặt, các chức năng được kiểm thử theo từng use case để đối
chiếu với đặc tả yêu cầu. Kết quả kiểm thử được tổng hợp ở Chương 5.

## 1.3. Đối tượng và phạm vi nghiên cứu

### 1.3.1. Đối tượng nghiên cứu

Đối tượng nghiên cứu của đề tài gồm hai nhóm:

- **Nghiệp vụ của nhà sách BookMark:** quy trình bán hàng tại quầy, bán
  hàng trực tuyến, đặt trước, thanh toán, quản lý kho (nhập kho, tồn
  kho, kiểm kê), quản lý danh mục hàng hóa và báo cáo doanh thu. Mặt
  hàng kinh doanh gồm sách các thể loại, truyện tranh (bao gồm bộ truyện
  và combo) và đồ dùng học tập.

- **Các đối tượng sử dụng hệ thống (actor):** khách hàng, nhân viên thu
  ngân, nhân viên kho và quản trị viên. Mỗi actor có nhu cầu và quyền
  hạn riêng, từ đó quyết định chức năng và giao diện tương ứng trong hệ
  thống.

### 1.3.2. Phạm vi nghiên cứu

**Phạm vi chức năng.** Hệ thống gồm 17 use case (UC01 – UC17) phân theo
4 actor như bảng dưới đây. Đây cũng là khung để các chương sau (đặc tả
yêu cầu, thiết kế, xây dựng giao diện) triển khai thống nhất.

|  |  |  |
|:--:|:--:|:--:|
| **Actor** | **Use case** | **Nhóm chức năng** |
| Khách hàng | UC10. Đăng ký/Đăng nhập | Mua hàng trực tuyến |
| Khách hàng | UC11. Tìm kiếm bộ truyện/combo | Mua hàng trực tuyến |
| Khách hàng | UC12. Thêm vào giỏ hàng online | Mua hàng trực tuyến |
| Khách hàng | UC13. Đặt trước (Pre-order) | Mua hàng trực tuyến |
| Khách hàng | UC14. Thanh toán đơn hàng trực tuyến | Mua hàng trực tuyến |
| Nhân viên thu ngân | UC01. Đăng nhập POS | Bán hàng tại quầy |
| Nhân viên thu ngân | UC02. Tra cứu sản phẩm | Bán hàng tại quầy |
| Nhân viên thu ngân | UC03. Thêm vào giỏ hàng POS | Bán hàng tại quầy |
| Nhân viên thu ngân | UC04. Áp dụng mã voucher/Tích điểm | Bán hàng tại quầy |
| Nhân viên thu ngân | UC05. Thanh toán và In hóa đơn | Bán hàng tại quầy |
| Nhân viên kho | UC06. Lập phiếu nhập kho | Quản lý kho |
| Nhân viên kho | UC07. Cập nhật tồn kho | Quản lý kho |
| Nhân viên kho | UC08. Lập phiếu kiểm kê | Quản lý kho |
| Quản trị viên | UC09. Duyệt phiếu kiểm kê | Quản lý kho |
| Quản trị viên | UC15. Quản lý danh mục hàng hóa | Quản trị |
| Quản trị viên | UC16. Quản lý tài khoản và phân quyền | Quản trị |
| Quản trị viên | UC17. Xem báo cáo doanh thu | Quản trị |

**Phạm vi công nghệ và môi trường.** Hệ thống là ứng dụng web chạy trên
trình duyệt, xây dựng bằng bộ công nghệ ReactJS, Node.js/Express và
PostgreSQL như đã nêu ở mục 1.2.2. Thanh toán trực tuyến chỉ thực hiện
trên môi trường thử nghiệm (sandbox) của cổng thanh toán.

**Những nội dung nằm ngoài phạm vi.** Để đề tài tập trung vào 17 Use
Case đã xác định, các nội dung sau không thuộc phạm vi thực hiện:

- Ứng dụng di động dành riêng cho hệ điều hành iOS hoặc Android.

- Giao dịch thanh toán thật với tiền thật; tích hợp đơn vị vận chuyển và
  theo dõi giao hàng.

- Quản lý nhiều chi nhánh, kế toán, thuế, nhân sự và tính lương.

- Kết nối trực tiếp phần cứng chuyên dụng (máy quét mã vạch, máy in
  nhiệt, ngăn kéo tiền); việc in hóa đơn chỉ thực hiện ở mức in từ trình
  duyệt hoặc xuất PDF.

## 1.4. Ý nghĩa thực tiễn

Kết quả của đề tài mang lại ý nghĩa ở hai phương diện, tương ứng với hai
nhóm vấn đề đã nêu ở mục 1.1.

**Đối với nhà sách.**

- Tập trung dữ liệu bán hàng, kho và khách hàng vào một cơ sở dữ liệu
  duy nhất, giúp số liệu tồn kho và doanh thu nhất quán giữa kênh tại
  quầy và kênh trực tuyến.

- Rút ngắn thời gian thanh toán tại quầy, giảm sai sót khi áp dụng
  voucher, tích điểm và in hóa đơn.

- Tăng khả năng kiểm soát nhờ phiếu nhập kho, kiểm kê có duyệt và phân
  quyền theo vai trò.

- Mở rộng thêm kênh bán hàng trực tuyến và đặt trước, góp phần tiếp cận
  khách hàng ngoài cửa hàng.

- Cung cấp báo cáo doanh thu để chủ cửa hàng ra quyết định nhập hàng và
  khuyến mãi dựa trên số liệu thực tế.

**Đối với người thực hiện đề tài.**

- Vận dụng đầy đủ quy trình phát triển phần mềm: khảo sát, phân tích,
  thiết kế bằng UML, thiết kế cơ sở dữ liệu và API, lập trình, kiểm thử.

- Thực hành bộ công nghệ web phổ biến trong thực tế (ReactJS,
  Node.js/Express, PostgreSQL, Prisma) cùng các kỹ thuật bảo mật cơ bản
  như JWT, bcrypt và RBAC.

- Sản phẩm và tài liệu có thể làm nền tảng để mở rộng thành hệ thống
  hoàn chỉnh hơn, hoặc làm tài liệu tham khảo cho các đề tài về quản lý
  bán lẻ.

## 1.5. Bố cục đề tài

Nội dung đồ án được tổ chức theo trình tự từ vấn đề, cơ sở lý thuyết,
phân tích thiết kế đến hiện thực và đánh giá, gồm 5 chương:

- **Chương 1: Tổng quan.** Nêu lý do chọn đề tài, mục tiêu, phương pháp,
  đối tượng, phạm vi và ý nghĩa thực tiễn. Chương này xác định bài toán
  và khung 17 Use Case mà các chương sau cùng thực hiện.

- **Chương 2: Cơ sở lý thuyết.** Trình bày các công nghệ, kiến trúc và
  công cụ được sử dụng theo phương pháp ở mục 1.2.2: JavaScript,
  HTML/CSS, ReactJS, Node.js/Express, RESTful API, PostgreSQL, Prisma,
  JWT, bcrypt, RBAC, cổng thanh toán VNPay, các thư viện hỗ trợ và công
  cụ phát triển.

- **Chương 3: Phân tích thiết kế hệ thống.** Đặc tả yêu cầu chức năng và
  phi chức năng; xây dựng sơ đồ use case, sơ đồ lớp và sơ đồ tuần tự;
  thiết kế kiến trúc, cơ sở dữ liệu và API cho 17 Use Case thuộc phạm vi
  đề tài.

- **Chương 4: Xây dựng hệ thống.** Giới thiệu giao diện và chức năng đã
  cài đặt cho từng actor: khách hàng, thu ngân (POS), nhân viên kho và
  quản trị viên.

- **Chương 5: Kết quả thực hiện.** Đánh giá kết quả đạt được so với mục
  tiêu ở mục 1.2.1, nêu các hạn chế còn tồn tại và đề xuất hướng phát
  triển.

# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT

|  |  |  |
|:--:|:--:|:--:|
| **Tầng / nhóm** | **Công nghệ** | **Phục vụ chủ yếu cho** |
| Giao diện | ReactJS, Vite, React Router, Tailwind CSS, Ant Design | Giao diện khách hàng, POS, kho, quản trị (UC01 – UC17) |
| Máy chủ | Node.js, Express.js, RESTful API | Xử lý nghiệp vụ và cung cấp API cho mọi use case |
| Dữ liệu | PostgreSQL, Prisma ORM | Lưu trữ sản phẩm, đơn hàng, tồn kho |
| Bảo mật | JWT, bcrypt, RBAC | UC01, UC10, UC16 và phân quyền cho toàn hệ thống |
| Thanh toán | VNPay (sandbox) | UC14. Thanh toán đơn hàng trực tuyến |
| Thư viện | Zod, react-to-print, Recharts/Chart.js | Kiểm tra dữ liệu, UC05 (in hóa đơn), UC17 (báo cáo) |

## 2.1. Ngôn ngữ JavaScript

JavaScript là ngôn ngữ lập trình bậc cao, đa mô hình, được thông dịch và
chạy trực tiếp trong trình duyệt. Từ khi có Node.js, JavaScript còn chạy
được ở phía máy chủ. Các đặc điểm quan trọng của ngôn ngữ gồm:

- **Kiểu động và hàm là đối tượng hạng nhất:** hàm có thể được truyền
  như tham số, rất tiện cho việc xử lý sự kiện và gọi lại (callback).

- **Lập trình bất đồng bộ:** Promise và cú pháp async/await giúp thực
  hiện các thao tác chậm như gọi API hay truy vấn cơ sở dữ liệu mà không
  chặn luồng chính.

- **Các tính năng của chuẩn ES6 trở lên:** arrow function, module
  (import/export), destructuring, spread operator, template literal giúp
  mã nguồn ngắn gọn và dễ bảo trì.

**Vai trò trong đề tài:** toàn bộ hệ thống, cả giao diện lẫn máy chủ,
dùng chung một ngôn ngữ. Nhờ vậy cấu trúc dữ liệu như sản phẩm hay đơn
hàng có thể được mô tả nhất quán giữa hai phía, và người thực hiện không
phải chuyển đổi giữa nhiều ngôn ngữ.

## 2.2. HTML và CSS

**HTML** (HyperText Markup Language) là ngôn ngữ đánh dấu mô tả cấu trúc
và nội dung của trang web thông qua các thẻ như tiêu đề, đoạn văn, bảng,
biểu mẫu. **CSS** (Cascading Style Sheets) mô tả cách trình bày: màu
sắc, phông chữ, khoảng cách và bố cục. CSS hiện đại cung cấp Flexbox và
Grid để dàn trang, cùng media query để giao diện thích ứng với nhiều
kích thước màn hình (responsive).

**Vai trò trong đề tài:** HTML và CSS là nền tảng cuối cùng của mọi giao
diện. Mã JSX của React được biên dịch thành các phần tử HTML, còn
Tailwind CSS và Ant Design (mục 2.3.3) đều là lớp trừu tượng phía trên
CSS. Giao diện khách hàng cần responsive vì người dùng truy cập từ cả
máy tính lẫn điện thoại.

## 2.3. ReactJS

ReactJS là thư viện JavaScript mã nguồn mở dùng để xây dựng giao diện
người dùng theo hướng thành phần (component). Mỗi component là một đơn
vị giao diện độc lập, nhận dữ liệu đầu vào qua *props*, quản lý dữ liệu
nội bộ qua *state* và có thể tái sử dụng nhiều lần. Một số khái niệm cốt
lõi:

- **JSX:** cú pháp cho phép viết cấu trúc giao diện ngay trong mã
  JavaScript.

- **Hooks:** các hàm như useState (lưu trạng thái), useEffect (xử lý tác
  vụ phụ như gọi API khi component hiển thị), useContext (chia sẻ dữ
  liệu như thông tin đăng nhập).

- **Virtual DOM:** React so sánh phiên bản giao diện mới với phiên bản
  cũ rồi chỉ cập nhật phần thay đổi lên DOM thật, giúp giao diện phản
  hồi nhanh.

- **Ứng dụng một trang (SPA):** trang chỉ tải một lần, các chuyển màn
  hình sau đó diễn ra ở phía trình duyệt và dữ liệu được lấy qua API.

**Vai trò trong đề tài:** ReactJS dùng để xây dựng cả bốn giao diện
(khách hàng, POS, kho, quản trị). Các thành phần lặp lại như thẻ sản
phẩm, giỏ hàng, bảng danh sách được viết một lần và dùng chung giữa các
màn hình.

### 2.3.1. Giới thiệu và Vite

Vite là công cụ khởi tạo và đóng gói dự án frontend. Ở chế độ phát
triển, Vite chạy máy chủ cục bộ dựa trên ES Modules gốc của trình duyệt
nên khởi động nhanh và có cơ chế cập nhật nóng (HMR), nghĩa là khi sửa
mã, giao diện được làm mới ngay mà không cần tải lại toàn trang. Ở chế
độ triển khai, Vite đóng gói, nén và tối ưu mã nguồn thành các tệp tĩnh.
Đề tài dùng Vite để tạo dự án React và quản lý biến môi trường như địa
chỉ API.

### 2.3.2. React Router

React Router là thư viện định tuyến phía client: nó ánh xạ địa chỉ URL
tới component tương ứng mà không tải lại trang. Thư viện hỗ trợ route
lồng nhau, tham số trên đường dẫn (ví dụ chi tiết một sản phẩm) và
chuyển hướng. Trong đề tài, các nhóm màn hình được tách thành các khu
vực riêng, chẳng hạn khu vực khách hàng, khu vực POS, khu vực kho và khu
vực quản trị. Mỗi khu vực được bọc bằng một route bảo vệ: nếu người dùng
chưa đăng nhập hoặc không có vai trò phù hợp thì bị chuyển về trang đăng
nhập. Cơ chế này kết hợp với RBAC ở mục 2.8.3.

### 2.3.3. Tailwind CSS và Ant Design

**Tailwind CSS** là framework CSS theo hướng utility-first: giao diện
được dựng bằng cách gắn trực tiếp các lớp tiện ích nhỏ (khoảng cách,
màu, cỡ chữ, flex, grid) vào phần tử. Cách này giữ phong cách nhất quán
và bỏ được phần lớn tệp CSS riêng.

**Ant Design** là thư viện component dựng sẵn cho React, gồm bảng dữ
liệu, biểu mẫu, hộp thoại, thông báo, lịch chọn ngày và nhiều thành phần
khác.

Hai thư viện bổ trợ cho nhau: Ant Design dùng cho các màn hình thiên về
nhập liệu và hiển thị bảng như POS, phiếu nhập kho, phiếu kiểm kê, trang
quản trị; Tailwind CSS dùng để tinh chỉnh bố cục và dựng giao diện cửa
hàng trực tuyến cho khách hàng.

## 2.4. Node.js và Express.js

**Node.js** là môi trường chạy JavaScript ngoài trình duyệt, xây dựng
trên động cơ V8. Node.js hoạt động theo mô hình hướng sự kiện và vào/ra
không chặn (non-blocking I/O): khi một yêu cầu đang chờ cơ sở dữ liệu,
tiến trình vẫn tiếp tục nhận các yêu cầu khác. Đặc điểm này phù hợp với
ứng dụng web có nhiều yêu cầu ngắn như tra cứu sản phẩm hay thêm vào giỏ
hàng.

**Express.js** là framework web tối giản chạy trên Node.js. Express cung
cấp:

- **Định tuyến (routing):** gắn mỗi cặp (phương thức HTTP, đường dẫn)
  với một hàm xử lý.

- **Middleware:** các hàm chạy lần lượt trước khi đến hàm xử lý chính,
  dùng cho ghi nhật ký, kiểm tra token, kiểm tra quyền, kiểm tra dữ liệu
  đầu vào và bắt lỗi tập trung.

**Vai trò trong đề tài:** backend được tổ chức theo luồng một yêu cầu đi
qua các lớp: *route → middleware xác thực và phân quyền → middleware
kiểm tra dữ liệu → controller → service (nghiệp vụ) → Prisma →
PostgreSQL*. Việc tách lớp như vậy làm mỗi use case có chỗ cài đặt rõ
ràng và dễ kiểm thử, đồng thời là cơ sở cho phần kiến trúc ở mục 3.8.

## 2.5. Kiến trúc RESTful API

REST (Representational State Transfer) là phong cách thiết kế API trên
giao thức HTTP, trong đó mọi thứ được xem là *tài nguyên* (sản phẩm, đơn
hàng, phiếu nhập...) và được xác định bằng một URL. Các nguyên tắc chính
gồm:

- **Client – server:** giao diện và máy chủ tách biệt, chỉ trao đổi qua
  API.

- **Phi trạng thái (stateless):** mỗi yêu cầu mang đủ thông tin để máy
  chủ xử lý, ví dụ gửi kèm token xác thực.

- **Giao diện thống nhất:** dùng các phương thức HTTP theo đúng ngữ
  nghĩa và dữ liệu trao đổi ở dạng JSON.

|                 |             |                            |
|:---------------:|:-----------:|:--------------------------:|
| **Phương thức** | **Ý nghĩa** |    **Ví dụ (minh họa)**    |
|       GET       | Đọc dữ liệu |   Lấy danh sách sản phẩm   |
|      POST       |   Tạo mới   |     Tạo phiếu nhập kho     |
|   PUT / PATCH   |  Cập nhật   |      Cập nhật tồn kho      |
|     DELETE      |     Xóa     | Xóa sản phẩm khỏi giỏ hàng |

Mã trạng thái HTTP cho biết kết quả: 200 (thành công), 201 (tạo mới
thành công), 400 (dữ liệu không hợp lệ), 401 (chưa xác thực), 403 (không
đủ quyền), 404 (không tìm thấy), 500 (lỗi máy chủ).

**Vai trò trong đề tài:** RESTful API là cầu nối duy nhất giữa giao diện
React và máy chủ. Danh sách endpoint theo từng module sẽ được thiết kế ở
mục 3.10.

## 2.6. Hệ quản trị cơ sở dữ liệu PostgreSQL

### 2.6.1. Giới thiệu PostgreSQL

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ - đối tượng mã nguồn mở,
được đánh giá cao về độ tin cậy, tuân thủ chuẩn SQL và khả năng mở rộng.
Dữ liệu được tổ chức thành các bảng liên kết với nhau bằng khóa chính và
khóa ngoại. PostgreSQL hỗ trợ nhiều kiểu dữ liệu (số chính xác NUMERIC
cho tiền tệ, thời gian TIMESTAMP, văn bản, JSON/JSONB), chỉ mục (index)
để tăng tốc tìm kiếm và các ràng buộc (NOT NULL, UNIQUE, CHECK) để giữ
dữ liệu đúng.

**Vai trò trong đề tài:** dữ liệu của nhà sách có quan hệ chặt chẽ (một
đơn hàng gồm nhiều chi tiết, mỗi chi tiết thuộc một sản phẩm, mỗi sản
phẩm thuộc một danh mục và có số lượng tồn) nên mô hình quan hệ là lựa
chọn phù hợp. Kiểu NUMERIC được dùng cho giá tiền để tránh sai số làm
tròn.

### 2.6.2. Transaction và tính toàn vẹn dữ liệu

Transaction (giao dịch) là một nhóm thao tác cơ sở dữ liệu được thực
hiện như một khối: hoặc tất cả cùng thành công (commit), hoặc nếu có lỗi
thì hoàn tác toàn bộ (rollback). Giao dịch đảm bảo bốn tính chất ACID:

- **Atomicity (nguyên tử):** thực hiện trọn vẹn hoặc không thực hiện gì.

- **Consistency (nhất quán):** dữ liệu luôn thỏa các ràng buộc sau mỗi
  giao dịch.

- **Isolation (cô lập):** các giao dịch chạy đồng thời không làm hỏng
  kết quả của nhau.

- **Durability (bền vững):** dữ liệu đã commit không bị mất khi hệ thống
  gặp sự cố.

**Vai trò trong đề tài:** nhiều use case cần nhiều bước ghi dữ liệu phải
thành công cùng nhau. Ví dụ ở UC05, việc thanh toán tạo hóa đơn, ghi chi
tiết, trừ tồn kho và cộng hoặc trừ điểm tích lũy phải nằm trong một giao
dịch; nếu một bước lỗi thì toàn bộ được hoàn tác, tránh hóa đơn đã tạo
mà tồn kho chưa trừ. Tương tự với nhập kho (UC06, UC07) và duyệt kiểm kê
(UC09). Cơ chế cô lập cũng giúp xử lý trường hợp hai khách cùng mua
quyển cuối cùng của một đầu sách, khi tồn kho phải được kiểm tra và trừ
một cách an toàn.

## 2.7. Prisma ORM

ORM (Object-Relational Mapping) là kỹ thuật ánh xạ bảng trong cơ sở dữ
liệu sang đối tượng trong mã nguồn, để lập trình viên thao tác dữ liệu
bằng ngôn ngữ lập trình thay vì viết câu lệnh SQL thuần. Prisma là ORM
cho Node.js gồm các phần chính:

- **Prisma Schema:** tệp khai báo các mô hình dữ liệu và quan hệ giữa
  chúng; đây là nguồn mô tả duy nhất của cấu trúc cơ sở dữ liệu.

- **Prisma Migrate:** sinh và áp dụng các tệp migration để cập nhật cấu
  trúc bảng, có lịch sử thay đổi rõ ràng.

- **Prisma Client:** thư viện truy vấn được sinh tự động từ schema, có
  kiểm tra kiểu dữ liệu nên giảm lỗi chính tả tên cột hoặc truyền sai
  kiểu. Prisma Client cũng hỗ trợ giao dịch để thực hiện nhiều thao tác
  trong một khối như đã nêu ở mục 2.6.2.

**Vai trò trong đề tài:** Prisma đóng vai trò lớp truy cập dữ liệu giữa
các service và PostgreSQL. Nhờ khai báo quan hệ trong schema, các truy
vấn như lấy đơn hàng kèm chi tiết và sản phẩm được viết ngắn gọn, còn
lược đồ cơ sở dữ liệu ở mục 3.9 có thể được chuyển trực tiếp thành
schema.

## 2.8. Xác thực và phân quyền

Hai khái niệm này thường được dùng cạnh nhau nhưng khác nhau: **xác thực
(authentication)** trả lời câu hỏi *người dùng là ai*, còn **phân quyền
(authorization)** trả lời câu hỏi *người dùng được làm gì*. Hệ thống
BookMark có bốn nhóm người dùng với quyền rất khác nhau, vì vậy cần cả
hai cơ chế.

### 2.8.1. JSON Web Token (JWT)

JWT là chuẩn mở để truyền thông tin giữa hai bên dưới dạng một chuỗi đã
được ký số. Một token gồm ba phần ngăn cách bằng dấu chấm: *header*
(thuật toán ký), *payload* (các thông tin như mã người dùng, vai trò,
thời điểm hết hạn) và *signature* (chữ ký xác nhận token không bị chỉnh
sửa).

Luồng sử dụng trong đề tài: (1) người dùng đăng nhập bằng tài khoản và
mật khẩu; (2) máy chủ kiểm tra và cấp một token có thời hạn; (3) ở các
yêu cầu sau, giao diện gửi token trong tiêu đề Authorization; (4)
middleware của Express kiểm tra chữ ký và thời hạn trước khi cho phép xử
lý. Vì token tự mang thông tin nên máy chủ không cần lưu phiên đăng
nhập, phù hợp với nguyên tắc phi trạng thái của REST. Cần lưu ý payload
chỉ được mã hóa dạng Base64 chứ không bí mật, do đó không đưa mật khẩu
hay dữ liệu nhạy cảm vào token, và khóa ký phải được giữ kín ở phía máy
chủ.

### 2.8.2. Mã hóa mật khẩu bằng bcrypt

Mật khẩu không bao giờ được lưu dạng văn bản thuần. bcrypt là thuật toán
băm mật khẩu một chiều, có hai đặc điểm quan trọng: mỗi lần băm sử dụng
một chuỗi ngẫu nhiên gọi là *salt* nên hai người cùng mật khẩu vẫn cho
hai giá trị băm khác nhau, và có *hệ số chi phí (cost factor)* điều
chỉnh độ chậm của phép băm, làm cho việc dò mật khẩu bằng vét cạn tốn
kém hơn nhiều. Khi đăng nhập, hệ thống băm mật khẩu người dùng nhập vào
rồi so sánh với giá trị đã lưu, chứ không giải mã ngược. Cơ chế này áp
dụng cho UC10 (đăng ký/đăng nhập của khách hàng), UC01 (đăng nhập POS)
và UC16 (quản trị tài khoản).

### 2.8.3. Phân quyền theo vai trò (RBAC)

RBAC (Role-Based Access Control) gán quyền cho *vai trò* thay vì gán
trực tiếp cho từng người; mỗi người dùng được gán một hoặc nhiều vai trò
và thừa hưởng quyền của các vai trò đó. Cách này dễ quản lý khi nhân sự
thay đổi: chỉ cần đổi vai trò của tài khoản.

Trong đề tài, bốn vai trò tương ứng bốn actor của sơ đồ use case, và
quyền truy cập được phân theo nhóm chức năng:

|  |  |
|:--:|:--:|
| **Vai trò** | **Nhóm chức năng được phép** |
| Khách hàng | UC10 – UC14 (mua hàng trực tuyến) |
| Nhân viên thu ngân | UC01 – UC05 (bán hàng POS) |
| Nhân viên kho | UC06 – UC08 (nhập kho, tồn kho, kiểm kê) |
| Quản trị viên | UC09 (duyệt kiểm kê), UC15 – UC17 (danh mục, tài khoản, báo cáo) |

Về kỹ thuật, vai trò được ghi trong JWT; một middleware phân quyền trên
máy chủ kiểm tra vai trò đó trước mỗi endpoint và trả mã 403 nếu không
phù hợp. Giao diện cũng ẩn các chức năng ngoài quyền, nhưng việc kiểm
tra bắt buộc luôn nằm ở máy chủ. Vai trò của người dùng được quản lý bởi
UC16.

## 2.9. Cổng thanh toán VNPay (sandbox)

Cổng thanh toán là dịch vụ trung gian cho phép website nhận tiền qua thẻ
ngân hàng, QR hoặc ví điện tử mà không tự xử lý thông tin thẻ. VNPay là
cổng phổ biến tại Việt Nam, cung cấp **môi trường thử nghiệm (sandbox)**
để lập trình viên kiểm thử luồng thanh toán mà không phát sinh giao dịch
thật.

Luồng thanh toán chung gồm các bước:

1.  Khách hàng xác nhận đơn hàng; máy chủ tạo đơn ở trạng thái chờ thanh
    toán.

2.  Máy chủ tạo yêu cầu thanh toán gồm mã đơn, số tiền và thông tin
    khác, rồi ký bằng chữ ký HMAC với khóa bí mật của merchant.

3.  Khách hàng được chuyển sang trang thanh toán của cổng và thực hiện
    thanh toán.

4.  Cổng chuyển khách về trang kết quả và gửi thông báo kết quả đến máy
    chủ (callback/IPN).

5.  Máy chủ kiểm tra chữ ký của kết quả, đối chiếu số tiền và mã đơn rồi
    mới cập nhật trạng thái đơn hàng.

Nguyên tắc an toàn: khóa bí mật chỉ nằm ở backend, trạng thái đơn hàng
chỉ được cập nhật sau khi máy chủ xác minh kết quả, không tin vào thông
tin do trình duyệt gửi lên.

**Vai trò trong đề tài:** tích hợp sandbox phục vụ UC14. Do đây là đồ án
học tập nên giao dịch chỉ thực hiện ở môi trường thử nghiệm như đã nêu ở
phạm vi (mục 1.3.2).

## 2.10. Thư viện hỗ trợ

### 2.10.1. Zod (kiểm tra dữ liệu)

Dữ liệu từ client luôn có thể sai hoặc bị làm giả, nên máy chủ phải kiểm
tra trước khi xử lý. Zod là các thư viện cho phép khai báo *schema* mô
tả dữ liệu hợp lệ (kiểu, độ dài, định dạng email, số lượng tối thiểu...)
rồi tự động kiểm tra và trả thông báo lỗi. Trong đề tài, thư viện này
được dùng như một middleware để kiểm tra dữ liệu đăng ký, giỏ hàng,
phiếu nhập kho, phiếu kiểm kê... trước khi chuyển đến lớp nghiệp vụ.

### 2.10.2. react-to-print hoặc xuất PDF (in hóa đơn)

UC05 yêu cầu in hóa đơn sau khi thanh toán. react-to-print cho phép in
một component React thông qua chức năng in của trình duyệt, với khuôn
mẫu hóa đơn riêng. Phương án thay thế là sinh tệp PDF rồi in hoặc lưu
lại. Cả hai phương án đều không cần kết nối phần cứng chuyên dụng, phù
hợp với phạm vi đề tài.

### 2.10.3. Recharts hoặc Chart.js (biểu đồ báo cáo)

Recharts (xây dựng riêng cho React) và Chart.js là các thư viện vẽ biểu
đồ từ dữ liệu. UC17 dùng chúng để hiển thị doanh thu theo thời gian,
theo danh mục bằng biểu đồ cột, đường, tròn, giúp quản trị viên nắm xu
hướng nhanh hơn so với bảng số liệu.

## 2.11. Công cụ và môi trường

### 2.11.1. Visual Studio Code

Visual Studio Code là trình soạn thảo mã nguồn miễn phí, nhẹ, có hệ sinh
thái tiện ích mở rộng phong phú (ESLint, Prettier, Prisma, Tailwind CSS
IntelliSense). Đây là công cụ viết mã chính của cả frontend và backend.

### 2.11.2. Git và GitHub

Git là hệ thống quản lý phiên bản phân tán, ghi lại lịch sử thay đổi mã
nguồn và hỗ trợ làm việc theo nhánh. GitHub là dịch vụ lưu trữ kho mã
(repository) trên mạng, giúp sao lưu, theo dõi tiến độ và cộng tác. Đề
tài dùng Git/GitHub để quản lý mã nguồn và tránh mất công sức khi có
lỗi.

### 2.11.3. Postman

Postman là công cụ gửi yêu cầu HTTP và xem kết quả, cho phép kiểm thử
API trước khi giao diện hoàn thiện. Các endpoint được gom thành bộ sưu
tập theo module và kiểm thử cả trường hợp thành công lẫn lỗi (thiếu
token, sai quyền, dữ liệu không hợp lệ).

### 2.11.4. PlantUML

PlantUML là phần mềm vẽ các sơ đồ UML như use case, lớp, tuần tự. Đề tài
dùng PlantUML để hoàn thiện các sơ đồ trình bày ở Chương 3, theo phương
pháp phân tích thiết kế đã nêu ở mục 1.2.2.

### 2.11.5. Supabase

Supabase là nền tảng cung cấp cơ sở dữ liệu PostgreSQL được lưu trữ trên
đám mây cùng các công cụ quản lý. Nếu cần chạy hệ thống trực tuyến, đề
tài có thể dùng Supabase để lưu trữ cơ sở dữ liệu thay cho việc tự cài
đặt PostgreSQL; vì cùng là PostgreSQL nên Prisma kết nối được mà không
cần thay đổi mô hình dữ liệu.

# CHƯƠNG 3: PHÂN TÍCH THIẾT KẾ HỆ THỐNG

## 3.1. Đặc tả yêu cầu

Các yêu cầu dưới đây được xây dựng từ việc khảo sát cách tổ chức nghiệp
vụ của các nhà sách có cả kênh trực tiếp và kênh trực tuyến như Fahasa,
sau đó thu gọn cho phù hợp với nhà sách BookMark và phạm vi 17 use case
đã nêu ở mục 1.3.2. Yêu cầu được chia thành hai nhóm: yêu cầu chức năng
(hệ thống làm gì) và yêu cầu phi chức năng (hệ thống làm tốt đến mức
nào).

### 3.1.1. Yêu cầu chức năng

Hệ thống có bốn nhóm người dùng (actor) với vai trò khác nhau, được tóm
tắt như sau:

|  |  |  |
|:--:|:--:|:--:|
| **Actor** | **Mô tả** | **Use case** |
| Khách hàng | Người mua sách, truyện tranh và đồ dùng học tập qua website của nhà sách | UC10 – UC14 |
| Nhân viên thu ngân | Nhân viên bán hàng tại quầy bằng màn hình POS, chịu trách nhiệm thanh toán và in hóa đơn | UC01 – UC05 |
| Nhân viên kho | Nhân viên phụ trách nhập hàng, theo dõi tồn kho và kiểm kê | UC06 – UC08 |
| Quản trị viên | Chủ hoặc quản lý nhà sách, quản lý danh mục, tài khoản, duyệt kiểm kê và xem báo cáo | UC09, UC15 – UC17 |

Yêu cầu chức năng của từng actor được mô tả bên dưới. Các use case được
trình bày theo thứ tự nghiệp vụ thay vì theo số hiệu để dễ theo dõi.

**a) Yêu cầu chức năng của Khách hàng**

|  |  |
|:--:|:--:|
| **Use case** | **Yêu cầu** |
| UC10. Đăng ký/Đăng nhập | Cho phép khách tạo tài khoản bằng thông tin cơ bản (họ tên, email hoặc số điện thoại, mật khẩu) và đăng nhập. Hệ thống kiểm tra tài khoản không bị trùng, lưu mật khẩu ở dạng đã băm và cấp token khi đăng nhập thành công. |
| UC11. Tìm kiếm bộ truyện/combo | Cho phép tìm sản phẩm theo tên, tác giả, thể loại hoặc danh mục; lọc và sắp xếp theo giá. Với bộ truyện và combo, hiển thị các thành phần, giá combo và tình trạng còn hàng. |
| UC12. Thêm vào giỏ hàng online | Cho phép thêm sản phẩm vào giỏ, thay đổi số lượng và xóa sản phẩm. Hệ thống kiểm tra số lượng không vượt quá tồn kho và luôn hiển thị tổng tạm tính. |
| UC13. Đặt trước (Pre-order) | Cho phép khách đặt trước sản phẩm chưa có hàng hoặc sắp phát hành. Hệ thống ghi nhận sản phẩm, số lượng, thông tin liên hệ và trạng thái đơn đặt trước; đơn này không làm giảm tồn kho cho đến khi hàng về.Khi sản phẩm có hàng trở lại, đơn đặt trước được chuyển sang trạng thái ‘Đã có hàng’ để cửa hàng liên hệ khách. |
| UC14. Thanh toán đơn hàng trực tuyến | Cho phép khách xác nhận đơn hàng và thanh toán qua cổng VNPay (sandbox). Trạng thái đơn chỉ chuyển sang đã thanh toán sau khi máy chủ xác minh kết quả từ cổng thanh toán; khi đó hệ thống trừ tồn kho.Nếu sau khi thanh toán tồn kho không còn đủ, đơn chuyển sang trạng thái ‘Chờ hoàn tiền. |

**b) Yêu cầu chức năng của Nhân viên thu ngân**

|  |  |
|:--:|:--:|
| **Use case** | **Yêu cầu** |
| UC01. Đăng nhập POS | Xác thực tài khoản nhân viên và chỉ cho phép vai trò thu ngân vào giao diện POS. |
| UC02. Tra cứu sản phẩm | Cho phép tìm sản phẩm theo tên hoặc mã sản phẩm và xem giá, tồn kho hiện tại để tư vấn cho khách tại quầy. |
| UC03. Thêm vào giỏ hàng POS | Cho phép thêm sản phẩm vào đơn đang lập, sửa số lượng, xóa dòng. Hệ thống kiểm tra tồn kho và cập nhật tổng tiền ngay. |
| UC04. Áp dụng mã voucher/Tích điểm | Cho phép nhập mã voucher và kiểm tra tính hợp lệ (còn hạn, đủ điều kiện áp dụng); cho phép tra cứu khách hàng thành viên để dùng điểm tích lũy. Tổng tiền được tính lại sau khi áp dụng. |
| UC05. Thanh toán và In hóa đơn | Cho phép chốt đơn, ghi nhận hình thức thanh toán, tạo hóa đơn, trừ tồn kho, cộng điểm tích lũy cho khách thành viên và in hóa đơn. Các bước này thành công hoặc hoàn tác cùng nhau. |

**c) Yêu cầu chức năng của Nhân viên kho**

|  |  |
|:--:|:--:|
| **Use case** | **Yêu cầu** |
| UC06. Lập phiếu nhập kho | Cho phép tạo phiếu nhập: chọn nhà cung cấp, thêm sản phẩm với số lượng và giá nhập, rồi lưu phiếu ở trạng thái chờ xác nhận. Việc lập phiếu chưa làm thay đổi tồn kho. |
| UC07. Cập nhật tồn kho | Cho phép xác nhận phiếu nhập: khi xác nhận, hệ thống cộng số lượng vào tồn kho và lưu lịch sử biến động. Cho phép xem tồn kho hiện tại, cảnh báo sản phẩm dưới ngưỡng tồn tối thiểu, xem lịch sử biến động của từng sản phẩm và hủy phiếu chưa xác nhận. |
| UC08. Lập phiếu kiểm kê | Cho phép nhập số lượng thực tế đếm được; hệ thống so sánh với số liệu trên hệ thống, tính chênh lệch từng sản phẩm và gửi phiếu để quản trị viên duyệt. |

**d) Yêu cầu chức năng của Quản trị viên**

|  |  |
|:--:|:--:|
| **Use case** | **Yêu cầu** |
| UC09. Duyệt phiếu kiểm kê | Cho phép xem phiếu kiểm kê và các chênh lệch, sau đó duyệt hoặc từ chối. Khi duyệt, hệ thống điều chỉnh tồn kho theo số liệu kiểm kê. |
| UC15. Quản lý danh mục hàng hóa | Cho phép thêm, sửa, ẩn danh mục và sản phẩm (sách, truyện tranh, đồ dùng học tập, bộ truyện, combo) cùng giá bán và hình ảnh. Sản phẩm đã phát sinh giao dịch được chuyển sang ngừng kinh doanh thay vì xóa để không mất lịch sử. |
| UC16. Quản lý tài khoản và phân quyền | Cho phép tạo tài khoản nhân viên, khóa hoặc mở khóa tài khoản, đặt lại mật khẩu và gán vai trò (thu ngân, nhân viên kho, quản trị viên). |
| UC17. Xem báo cáo doanh thu | Cho phép xem doanh thu theo ngày, tháng và danh mục, phân biệt kênh tại quầy với kênh trực tuyến, kèm biểu đồ trực quan. |

**e) Quy tắc nghiệp vụ chung**

Ngoài yêu cầu của từng use case, hệ thống tuân theo các quy tắc sau để
bảo đảm dữ liệu nhất quán:

- Số lượng tồn kho của một sản phẩm không được âm; mọi lần tăng giảm tồn
  (bán hàng, nhập kho, kiểm kê) đều được ghi lại để truy vết.

- Voucher chỉ áp dụng khi còn hạn và thỏa điều kiện của chương trình;
  điểm tích lũy chỉ được dùng khi khách hàng là thành viên và đủ điểm.

- Hóa đơn đã tạo không được sửa nội dung.

- Phiếu nhập kho chỉ làm tăng tồn kho sau khi được nhân viên kho xác
  nhận.

- Đơn đặt trước không làm giảm tồn kho; đơn trực tuyến chỉ trừ tồn kho
  sau khi máy chủ xác minh thanh toán thành công.

- Phiếu kiểm kê chỉ làm thay đổi tồn kho sau khi quản trị viên duyệt.

- Mỗi chức năng chỉ cho phép vai trò được phân công sử dụng, theo cơ chế
  RBAC ở mục 2.8.3.

### 3.1.2. Yêu cầu phi chức năng

Yêu cầu phi chức năng mô tả chất lượng mà hệ thống cần đạt. Mỗi yêu cầu
dưới đây đi kèm cách đáp ứng bằng công nghệ đã chọn ở Chương 2.

|  |  |  |
|:--:|:--:|:--:|
| **Nhóm** | **Yêu cầu** | **Cách đáp ứng** |
| Hiệu năng | Các thao tác thường dùng (tìm kiếm sản phẩm, thêm vào giỏ, thanh toán tại quầy) phản hồi trong vài giây trong điều kiện sử dụng bình thường. | Truy vấn có chỉ mục (index) trên PostgreSQL; giao diện SPA chỉ tải dữ liệu cần thiết qua API; Vite tối ưu mã khi triển khai. |
| Bảo mật | Chỉ người dùng đã xác thực mới truy cập chức năng nội bộ; mỗi vai trò chỉ dùng được chức năng của mình; mật khẩu và khóa bí mật không bị lộ. | JWT cho xác thực, RBAC cho phân quyền, bcrypt cho mật khẩu, khóa thanh toán chỉ nằm ở backend, kiểm tra dữ liệu đầu vào bằng Zod. |
| Toàn vẹn dữ liệu | Số liệu tồn kho, hóa đơn và doanh thu luôn khớp nhau, kể cả khi có lỗi giữa chừng hoặc nhiều người thao tác cùng lúc. | Transaction của PostgreSQL (ACID), ràng buộc khóa ngoại và NOT NULL/CHECK, giao dịch qua Prisma. |
| Độ tin cậy | Hệ thống xử lý lỗi rõ ràng, trả thông báo dễ hiểu và không làm mất dữ liệu đã lưu. | Middleware bắt lỗi tập trung ở Express, mã trạng thái HTTP đúng ngữ nghĩa, ghi nhật ký lỗi. |
| Khả năng sử dụng | Giao diện rõ ràng, thao tác POS nhanh, giao diện khách hàng dùng được trên cả máy tính và điện thoại. | Component dùng lại với Ant Design, bố cục responsive với Tailwind CSS, báo lỗi ngay tại biểu mẫu. |
| Tương thích | Chạy trên các trình duyệt phổ biến hiện nay, không phụ thuộc hệ điều hành của người dùng. | Ứng dụng web chuẩn HTML/CSS/JavaScript. |
| Bảo trì và mở rộng | Có thể sửa lỗi hoặc thêm chức năng mới mà ít ảnh hưởng phần khác. | Tách lớp route, middleware, controller, service; Prisma Migrate quản lý thay đổi cơ sở dữ liệu; Git quản lý phiên bản. |

## 3.2. Sơ đồ Use Case Tổng Quát 

<img src="docs/media/image3.png"
style="width:3.36806in;height:9.20278in" />

**3.3 PHÂN HỆ BÁN HÀNG TRỰC TUYẾN**

### 3.3.1. UC: ĐĂNG KÝ/ĐĂNG NHẬP

**A. Đặc tả Use Case**

**Tên UC:** Đăng ký/Đăng nhập

**Tác nhân:** Khách hàng (Customer)

**Mục đích:** Use Case này cho phép khách hàng tạo tài khoản mới hoặc
đăng nhập để mua hàng, đặt trước và theo dõi đơn hàng trên website.

**Tiền điều kiện:**

Khách hàng truy cập được website.

Với đăng nhập: khách hàng đã có tài khoản.

**1. Luồng sự kiện chính (đăng nhập)**

*Bảng 3.1: Luồng sự kiện chính Use Case Đăng ký/Đăng nhập*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Khách hàng (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Khách hàng chọn chức năng Đăng nhập. |  |
| 2 |  | Hệ thống hiển thị biểu mẫu đăng nhập. |
| 3 | Khách hàng nhập email hoặc số điện thoại và mật khẩu, nhấn nút Đăng nhập. |  |
| 4 |  | Hệ thống kiểm tra thông tin đăng nhập và trạng thái tài khoản. |
| 5 |  | Hệ thống cấp token JWT, chuyển về trang trước đó hoặc trang chủ và hiển thị tên khách hàng. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Đăng ký tài khoản mới: tại bước 1, khách hàng chọn Đăng ký, nhập họ tên,
email, số điện thoại, mật khẩu và xác nhận mật khẩu. Hệ thống kiểm tra
email và số điện thoại chưa trùng, mã hóa mật khẩu, tạo tài khoản và tự
động đăng nhập.

**b. Luồng ngoại lệ (Báo lỗi)**

Sai thông tin đăng nhập: tại bước 4, hệ thống báo lỗi chung (không nêu
rõ sai email hay mật khẩu) và cho nhập lại.

Email hoặc số điện thoại đã tồn tại: khi đăng ký, hệ thống báo lỗi và
không tạo tài khoản.

Mật khẩu xác nhận không khớp hoặc không đủ độ dài tối thiểu: hệ thống
báo lỗi tại ô tương ứng.

Tài khoản bị khóa: hệ thống thông báo liên hệ cửa hàng và không cho đăng
nhập.

**\**

2.  **Sơ đồ trình tự**

    <img src="docs/media/image4.png"
    style="width:6.2625in;height:7.98403in" />

### 3.3.2. UC: TÌM KIẾM BỘ TRUYỆN/COMBO

**A. Đặc tả Use Case**

**Tên UC:** Tìm kiếm bộ truyện/combo

**Tác nhân:** Khách hàng (Customer)

**Mục đích:** Use Case này cho phép khách hàng tìm nhanh bộ truyện,
combo theo từ khóa và bộ lọc để chọn sản phẩm cần mua.

**Tiền điều kiện:**

Khách hàng truy cập được website (không bắt buộc đăng nhập).

**1. Luồng sự kiện chính**

*Bảng 3.2: Luồng sự kiện chính Use Case Tìm kiếm bộ truyện/combo*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Khách hàng (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Khách hàng nhập từ khóa vào ô tìm kiếm. |  |
| 2 |  | Hệ thống tìm trong danh mục sản phẩm và combo. |
| 3 |  | Hệ thống hiển thị danh sách kết quả (ảnh bìa, tên, giá, tình trạng). |
| 4 | Khách hàng chọn một sản phẩm. |  |
| 5 |  | Hệ thống hiển thị trang chi tiết sản phẩm. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Lọc và sắp xếp: tại bước 3, khách hàng lọc theo thể loại, khoảng giá,
loại (bộ truyện hoặc combo) và sắp xếp theo giá hoặc độ mới. Hệ thống
cập nhật lại danh sách.

Chuyển trang: khách hàng chuyển giữa các trang kết quả.

**b. Luồng ngoại lệ (Báo lỗi)**

Không có kết quả: tại bước 3, hệ thống thông báo và gợi ý đổi từ khóa
hoặc bộ lọc.

Lỗi kết nối cơ sở dữ liệu: hệ thống báo lỗi và cho phép tải lại trang.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image5.png"
style="width:6.26181in;height:9.18056in" />

### 3.3.3. UC: THÊM VÀO GIỎ HÀNG ONLINE

**A. Đặc tả Use Case**

**Tên UC:** Thêm vào giỏ hàng online

**Tác nhân:** Khách hàng (Customer)

**Mục đích:** Use Case này cho phép khách hàng gom các sản phẩm, combo
muốn mua vào giỏ hàng trên website trước khi thanh toán.

**Tiền điều kiện:**

Khách hàng đã đăng nhập (UC Đăng ký/Đăng nhập).

Sản phẩm đang được kinh doanh.

**1. Luồng sự kiện chính**

*Bảng 3.3: Luồng sự kiện chính Use Case Thêm vào giỏ hàng online*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Khách hàng (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Khách hàng chọn sản phẩm hoặc combo, nhập số lượng và nhấn Thêm vào giỏ. |  |
| 2 |  | Hệ thống kiểm tra số lượng tồn kho. |
| 3 |  | Hệ thống thêm dòng vào giỏ hàng và tính lại tổng tiền. |
| 4 |  | Hệ thống hiển thị thông báo thêm thành công và cập nhật biểu tượng giỏ hàng. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Cộng dồn số lượng: nếu sản phẩm đã có trong giỏ, hệ thống cộng thêm vào
dòng hiện có.

Chỉnh sửa giỏ hàng: tại trang giỏ hàng, khách hàng sửa số lượng hoặc xóa
dòng, hệ thống tính lại tổng tiền.

Sản phẩm hết hàng: hệ thống gợi ý chuyển sang chức năng Đặt trước.

**b. Luồng ngoại lệ (Báo lỗi)**

Chưa đăng nhập: hệ thống chuyển khách hàng sang màn hình đăng nhập.

Số lượng vượt tồn kho: hệ thống báo lỗi và giới hạn theo số lượng tồn.

Số lượng nhỏ hơn hoặc bằng 0: hệ thống báo lỗi và không thêm.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image6.png"
style="width:6.38958in;height:9.28403in" />

### 3.3.4. UC: ĐẶT TRƯỚC (PRE-ORDER)

**A. Đặc tả Use Case**

**Tên UC:** Đặt trước (Pre-order)

**Tác nhân:** Khách hàng (Customer)

**Mục đích:** Use Case này cho phép khách hàng đăng ký đặt trước sản
phẩm chưa có sẵn hoặc sắp phát hành để cửa hàng ghi nhận nhu cầu và liên
hệ khi hàng về.

**Tiền điều kiện:**

Khách hàng đã đăng nhập.

Sản phẩm đang cho phép đặt trước.

**1. Luồng sự kiện chính**

*Bảng 3.4: Luồng sự kiện chính Use Case Đặt trước*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Khách hàng (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Khách hàng nhấn Đặt trước tại trang sản phẩm. |  |
| 2 |  | Hệ thống hiển thị biểu mẫu đặt trước (số lượng, thông tin nhận hàng). |
| 3 | Khách hàng nhập thông tin và nhấn Xác nhận đặt trước. |  |
| 4 |  | Hệ thống kiểm tra sản phẩm cho phép đặt trước và dữ liệu nhập. |
| 5 |  | Hệ thống lưu đơn đặt trước với trạng thái chờ hàng. |
| 6 |  | Hệ thống hiển thị mã đơn đặt trước. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Xem danh sách đơn đặt trước: khách hàng xem các đơn đặt trước của mình
và trạng thái từng đơn.

Hủy đơn đặt trước: khi đơn còn ở trạng thái chờ hàng, khách hàng được
hủy đơn.

Hàng về kho: khi sản phẩm có tồn kho, hệ thống chuyển các đơn đặt trước
của sản phẩm đó sang trạng thái “Đã có hàng” để cửa hàng liên hệ khách.

**b. Luồng ngoại lệ (Báo lỗi)**

Chưa đăng nhập: hệ thống chuyển sang màn hình đăng nhập.

Sản phẩm không hỗ trợ đặt trước: tại bước 4, hệ thống thông báo và không
tạo đơn.

Số lượng không hợp lệ hoặc thiếu thông tin nhận hàng: hệ thống báo lỗi
tại ô tương ứng.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image7.png"
style="width:7.09444in;height:8.83958in" />

### 3.3.5. UC: THANH TOÁN ĐƠN HÀNG TRỰC TUYẾN

**A. Đặc tả Use Case**

**Tên UC:** Thanh toán đơn hàng trực tuyến

**Tác nhân:** Khách hàng (Customer). Tác nhân phụ: Cổng thanh toán
(VNPay)

**Mục đích:** Use Case này cho phép khách hàng thanh toán đơn hàng qua
cổng thanh toán trực tuyến, sau đó hệ thống ghi nhận đơn và trừ tồn kho
tương ứng.

**Tiền điều kiện:**

Khách hàng đã đăng nhập.

Giỏ hàng có ít nhất một sản phẩm.

**1. Luồng sự kiện chính**

*Bảng 3.5: Luồng sự kiện chính Use Case Thanh toán đơn hàng trực tuyến*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Khách hàng (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Khách hàng chọn Thanh toán tại giỏ hàng. |  |
| 2 |  | Hệ thống hiển thị trang thanh toán (tóm tắt đơn, tổng tiền). |
| 3 | Khách hàng nhập địa chỉ nhận hàng, chọn phương thức thanh toán trực tuyến và nhấn Thanh toán. |  |
| 4 |  | Hệ thống kiểm tra tồn kho, tạo đơn hàng ở trạng thái chưa thanh toán và tạo giao dịch. |
| 5 |  | Hệ thống chuyển khách hàng sang cổng thanh toán. |
| 6 | Khách hàng xác nhận thanh toán trên cổng thanh toán. |  |
| 7 |  | Cổng thanh toán trả kết quả về hệ thống. Hệ thống kiểm tra chữ ký kết quả. |
| 8 |  | Hệ thống thực hiện: cập nhật đơn sang đã thanh toán, trừ tồn kho, làm trống giỏ hàng. |
| 9 |  | Hệ thống hiển thị kết quả thanh toán và mã đơn hàng. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Thanh toán lại: với đơn ở trạng thái chưa thanh toán, khách hàng chọn
thanh toán lại từ danh sách đơn hàng.

Hủy đơn: khách hàng hủy đơn chưa thanh toán, hệ thống cập nhật trạng
thái đơn.

**b. Luồng ngoại lệ (Báo lỗi)**

Tồn kho không đủ: tại bước 4, hệ thống báo sản phẩm thiếu hàng và yêu
cầu chỉnh lại giỏ.

Thanh toán thất bại hoặc bị hủy: đơn giữ trạng thái chưa thanh toán,
khách hàng có thể thử lại.

Cổng thanh toán không phản hồi: đơn giữ trạng thái chưa thanh toán, hệ
thống thông báo kiểm tra lại sau.

Chữ ký kết quả không hợp lệ: hệ thống từ chối cập nhật đơn và ghi nhận
lỗi để kiểm tra.

Tồn kho không đủ sau khi thanh toán thành công (tại bước 8): hệ thống
chuyển đơn sang trạng thái “Chờ hoàn tiền”, thông báo cho khách hàng và
quản trị viên để xử lý hoàn tiền.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image8.png"
style="width:6.26181in;height:9.38194in" />

**3.4. PHÂN HỆ BÁN HÀNG TẠI QUẦY (POS)**

### 3.4.1. UC: ĐĂNG NHẬP POS

**A. Đặc tả Use Case**

**Tên UC:** Đăng nhập POS

**Tác nhân:** Nhân viên thu ngân (Cashier)

**Mục đích:** Use Case này cho phép nhân viên thu ngân truy cập màn hình
bán hàng tại quầy bằng tài khoản được cấp, bảo đảm chỉ người có quyền
mới được bán hàng.

**Tiền điều kiện:**

Nhân viên đã có tài khoản với vai trò thu ngân do quản trị viên cấp.

Thiết bị tại quầy truy cập được hệ thống.

**1. Luồng sự kiện chính**

*Bảng 3.6: Luồng sự kiện chính Use Case Đăng nhập POS*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên thu ngân (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên mở màn hình POS. |  |
| 2 |  | Hệ thống hiển thị biểu mẫu đăng nhập POS. |
| 3 | Nhân viên nhập tên đăng nhập, mật khẩu và nhấn Đăng nhập. |  |
| 4 |  | Hệ thống kiểm tra thông tin, trạng thái và vai trò tài khoản. |
| 5 |  | Hệ thống cấp token JWT và mở màn hình bán hàng. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Ghi nhớ tên đăng nhập: nhân viên chọn Ghi nhớ, hệ thống lưu tên đăng
nhập trên trình duyệt (không lưu mật khẩu).

**b. Luồng ngoại lệ (Báo lỗi)**

Sai tên đăng nhập hoặc mật khẩu: tại bước 4, hệ thống báo lỗi và cho
nhập lại.

Tài khoản bị khóa: hệ thống thông báo liên hệ quản trị viên.

Tài khoản không có vai trò thu ngân: hệ thống từ chối truy cập màn hình
POS.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image9.png"
style="width:6.55139in;height:7.39861in" />

### 3.4.2. UC: TRA CỨU SẢN PHẨM

**A. Đặc tả Use Case**

**Tên UC:** Tra cứu sản phẩm

**Tác nhân:** Nhân viên thu ngân (Cashier)

**Mục đích:** Use Case này cho phép nhân viên thu ngân tìm nhanh sản
phẩm theo tên hoặc mã để xem giá bán và số lượng tồn khi phục vụ khách
tại quầy.

**Tiền điều kiện:**

Nhân viên thu ngân đã đăng nhập POS.

**1. Luồng sự kiện chính**

*Bảng 3.7: Luồng sự kiện chính Use Case Tra cứu sản phẩm*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên thu ngân (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên nhập tên hoặc mã sản phẩm vào ô tìm kiếm. |  |
| 2 |  | Hệ thống tìm trong danh mục sản phẩm. |
| 3 |  | Hệ thống hiển thị danh sách gồm mã, tên, giá bán và số lượng tồn. |
| 4 | Nhân viên chọn sản phẩm cần bán. |  |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Lọc theo nhóm hàng: tại bước 1, nhân viên chọn nhóm hàng để thu hẹp kết
quả.

Tìm combo: nhân viên tìm combo thay cho sản phẩm lẻ.

**b. Luồng ngoại lệ (Báo lỗi)**

Không tìm thấy sản phẩm: tại bước 3, hệ thống thông báo không có kết
quả.

Lỗi kết nối cơ sở dữ liệu: hệ thống báo lỗi và cho phép thử lại.

**\**

2.  **Sơ đồ trình tự**

<img src="docs/media/image10.png"
style="width:6.62778in;height:8.78194in" />**\**

### 3.4.3. UC: THÊM VÀO GIỎ HÀNG POS

**A. Đặc tả Use Case**

**Tên UC:** Thêm vào giỏ hàng POS

**Tác nhân:** Nhân viên thu ngân (Cashier)

**Mục đích:** Use Case này cho phép nhân viên thu ngân lập giỏ hàng của
đơn đang bán, thêm sản phẩm và chỉnh số lượng theo yêu cầu của khách.

**Tiền điều kiện:**

Nhân viên thu ngân đã đăng nhập POS.

Sản phẩm cần bán đã được tra cứu và hiển thị trong kết quả.

**1. Luồng sự kiện chính**

*Bảng 3.8: Luồng sự kiện chính Use Case Thêm vào giỏ hàng POS*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên thu ngân (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên chọn sản phẩm từ kết quả tra cứu. |  |
| 2 |  | Hệ thống hiển thị ô nhập số lượng (mặc định 1). |
| 3 | Nhân viên nhập số lượng và nhấn Thêm. |  |
| 4 |  | Hệ thống kiểm tra số lượng tồn kho. |
| 5 |  | Hệ thống thêm dòng vào giỏ hàng và tính lại tổng tiền. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Cộng dồn số lượng: nếu sản phẩm đã có trong giỏ, hệ thống cộng thêm vào
dòng hiện có.

Chỉnh sửa giỏ hàng: nhân viên sửa số lượng hoặc xóa dòng trong giỏ, hệ
thống tính lại tổng tiền.

**b. Luồng ngoại lệ (Báo lỗi)**

Số lượng nhỏ hơn hoặc bằng 0: tại bước 4, hệ thống báo lỗi và không
thêm.

Số lượng vượt tồn kho hoặc tồn kho bằng 0: hệ thống cảnh báo và không
cho thêm, bảo đảm không bán hàng đã hết.

**B**. **Sơ đồ trình tự**

<img src="docs/media/image11.png"
style="width:6.37847in;height:9.22431in" />

### 3.4.4. UC: ÁP DỤNG MÃ VOUCHER/TÍCH ĐIỂM

**A. Đặc tả Use Case**

**Tên UC:** Áp dụng mã voucher/Tích điểm

**Tác nhân:** Nhân viên thu ngân (Cashier)

**Mục đích:** Use Case này cho phép nhân viên thu ngân áp dụng mã
voucher hoặc điểm tích lũy của khách thành viên để giảm giá đơn hàng tại
quầy.

**Tiền điều kiện:**

Nhân viên thu ngân đã đăng nhập POS.

Giỏ hàng POS có ít nhất một sản phẩm.

**1. Luồng sự kiện chính**

*Bảng 3.9: Luồng sự kiện chính Use Case Áp dụng mã voucher/Tích điểm*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên thu ngân (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên nhấn Voucher/Tích điểm. |  |
| 2 |  | Hệ thống hiển thị hộp thoại nhập ưu đãi. |
| 3 | Nhân viên nhập mã voucher, hoặc nhập số điện thoại khách thành viên và số điểm muốn dùng, rồi nhấn Áp dụng. |  |
| 4 |  | Hệ thống kiểm tra điều kiện (còn hạn, còn lượt dùng, đủ điểm). |
| 5 |  | Hệ thống tính số tiền giảm và cập nhật tổng thanh toán. |
| 6 |  | Hệ thống hiển thị số tiền giảm và tổng thanh toán mới. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Áp dụng đồng thời voucher và điểm tích lũy cho cùng một đơn.

Gỡ ưu đãi: nhân viên gỡ voucher hoặc điểm đã áp dụng, hệ thống trả tổng
thanh toán về giá gốc.

**b. Luồng ngoại lệ (Báo lỗi)**

Mã không tồn tại, hết hạn hoặc hết lượt dùng: tại bước 4, hệ thống báo
lỗi và giữ nguyên giá.

Đơn chưa đạt giá trị tối thiểu của voucher: hệ thống báo lỗi và giữ
nguyên giá.

Không tìm thấy khách thành viên hoặc không đủ điểm: hệ thống báo lỗi và
giữ nguyên giá.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image12.png"
style="width:6.67431in;height:9.34583in" />

### 3.4.5. UC: THANH TOÁN VÀ IN HÓA ĐƠN

**A. Đặc tả Use Case**

**Tên UC:** Thanh toán và In hóa đơn

**Tác nhân:** Nhân viên thu ngân (Cashier)

**Mục đích:** Use Case này cho phép nhân viên thu ngân chốt đơn tại
quầy, ghi nhận thanh toán, cập nhật tồn kho và in hóa đơn cho khách.

**Tiền điều kiện:**

Nhân viên thu ngân đã đăng nhập POS.

Giỏ hàng POS có ít nhất một sản phẩm.

**1. Luồng sự kiện chính**

*Bảng 3.10: Luồng sự kiện chính Use Case Thanh toán và In hóa đơn*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên thu ngân (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên nhấn Thanh toán. |  |
| 2 |  | Hệ thống hiển thị màn hình thanh toán (danh sách dòng, tổng thanh toán). |
| 3 | Nhân viên chọn phương thức thanh toán và nhập số tiền khách đưa. |  |
| 4 |  | Hệ thống tính và hiển thị tiền thừa. |
| 5 | Nhân viên nhấn Xác nhận. |  |
| 6 |  | Hệ thống thực hiện: lưu đơn hàng và hóa đơn, trừ tồn kho, cộng điểm tích lũy nếu khách là thành viên. |
| 7 |  | Hệ thống in hóa đơn cho khách. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Khách không lấy hóa đơn giấy: hệ thống chỉ lưu hóa đơn, bỏ qua bước in.

In lại hóa đơn: nhân viên in lại hóa đơn của đơn đã hoàn tất.

**b. Luồng ngoại lệ (Báo lỗi)**

Số tiền khách đưa nhỏ hơn tổng thanh toán: tại bước 5, hệ thống không
cho hoàn tất.

Tồn kho thay đổi và không còn đủ: hệ thống báo sản phẩm thiếu và yêu cầu
chỉnh lại giỏ hàng.

Lỗi máy in: đơn vẫn được lưu, hệ thống cho phép in lại.

Lỗi khi lưu dữ liệu: hệ thống hủy toàn bộ giao dịch (rollback) và giữ
nguyên giỏ hàng.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image13.png"
style="width:6.75069in;height:9.33889in" />

**3.5. PHÂN HỆ QUẢN LÝ KHO**

### 3.5.1. UC: LẬP PHIẾU NHẬP KHO

**A. Đặc tả Use Case**

**Tên UC:** Lập phiếu nhập kho

**Tác nhân:** Nhân viên kho (Warehouse)

**Mục đích:** Use Case này cho phép nhân viên kho lập phiếu ghi nhận
hàng nhập từ nhà cung cấp, chờ xác nhận để cập nhật tồn kho.

**Tiền điều kiện:**

Nhân viên kho đã đăng nhập vào hệ thống.

Nhà cung cấp và các sản phẩm cần nhập đã tồn tại trong hệ thống.

**1. Luồng sự kiện chính**

*Bảng 3.11: Luồng sự kiện chính Use Case Lập phiếu nhập kho*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên kho (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên kho chọn chức năng Lập phiếu nhập. |  |
| 2 |  | Hệ thống hiển thị màn hình tạo phiếu nhập mới. |
| 3 | Nhân viên chọn nhà cung cấp và ngày nhập. |  |
| 4 | Nhân viên thêm từng sản phẩm nhập, nhập số lượng và giá nhập. |  |
| 5 |  | Hệ thống tính thành tiền từng dòng và tổng tiền nhập. |
| 6 | Nhân viên nhấn nút Lưu phiếu. |  |
| 7 |  | Hệ thống kiểm tra tính hợp lệ của dữ liệu (số lượng lớn hơn 0, giá nhập không âm, phiếu có ít nhất một dòng). |
| 8 |  | Hệ thống thực hiện: lưu phiếu nhập ở trạng thái “Chờ xác nhận”, ghi nhận người lập phiếu. |
| 9 |  | Hệ thống hiển thị thông báo "Lập phiếu nhập kho thành công". |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Lưu nháp: tại bước 6, nhân viên chọn Lưu nháp, hệ thống lưu phiếu ở
trạng thái nháp và chưa cộng tồn kho để nhập tiếp sau.

In phiếu nhập: sau khi hoàn tất, hệ thống cho phép in phiếu nhập làm
chứng từ đối soát với nhà cung cấp.

**b. Luồng ngoại lệ (Báo lỗi)**

Sản phẩm chưa có trong danh mục: tại bước 4, hệ thống thông báo và yêu
cầu quản trị viên thêm sản phẩm mới trước.

Số lượng nhỏ hơn hoặc bằng 0, hoặc giá nhập nhỏ hơn 0: tại bước 7, hệ
thống báo đỏ tại ô tương ứng và không cho lưu phiếu.

Phiếu không có dòng sản phẩm nào: hệ thống không cho lưu.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image14.png"
style="width:6.41875in;height:9.42153in" />

### 3.5.2. UC: LẬP PHIẾU KIỂM KÊ

**A. Đặc tả Use Case**

**Tên UC:** Lập phiếu kiểm kê

**Tác nhân:** Nhân viên kho (Warehouse)

**Mục đích:** Use Case này cho phép nhân viên kho đối chiếu số lượng
hàng thực tế với số liệu trên hệ thống theo từng nhóm hàng, ghi nhận
chênh lệch và gửi quản trị viên duyệt.

**Tiền điều kiện:**

Nhân viên kho đã đăng nhập vào hệ thống.

Nhóm hàng cần kiểm kê có sản phẩm trong hệ thống.

**1. Luồng sự kiện chính**

*Bảng 3.12: Luồng sự kiện chính Use Case Lập phiếu kiểm kê*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Nhân viên kho (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Nhân viên kho chọn chức năng Lập phiếu kiểm kê. |  |
| 2 |  | Hệ thống hiển thị màn hình tạo phiếu kiểm kê mới. |
| 3 | Nhân viên chọn nhóm hàng cần kiểm kê. |  |
| 4 |  | Hệ thống hiển thị danh sách sản phẩm của nhóm hàng cùng số lượng tồn theo hệ thống. |
| 5 | Nhân viên nhập số lượng thực tế của từng sản phẩm. |  |
| 6 |  | Hệ thống tự tính chênh lệch giữa số thực tế và số trên hệ thống cho từng dòng. |
| 7 | Nhân viên nhấn nút Gửi duyệt. |  |
| 8 |  | Hệ thống kiểm tra tất cả dòng đã được nhập và hợp lệ. |
| 9 |  | Hệ thống lưu phiếu ở trạng thái chờ duyệt và hiển thị thông báo “Gửi phiếu kiểm kê thành công”. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Lưu nháp: nhân viên lưu phiếu ở trạng thái nháp và tiếp tục nhập sau.

Ghi chú chênh lệch: nhân viên ghi nguyên nhân cho các dòng có chênh lệch
trước khi gửi duyệt.

**b. Luồng ngoại lệ (Báo lỗi)**

Số lượng thực tế không hợp lệ (số âm, không phải số): tại bước 5, hệ
thống báo lỗi tại ô tương ứng.

Còn dòng chưa nhập khi gửi duyệt: tại bước 8, hệ thống yêu cầu nhập đủ
trước khi gửi.

Nhóm hàng đang có phiếu kiểm kê chờ duyệt: hệ thống không cho tạo phiếu
mới cho nhóm hàng đó.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image15.png"
style="width:6.92778in;height:9.36389in" />**\
3.5.3. UC: CẬP NHẬT TỒN KHO**

**A. Đặc tả Use Case**

**Tên UC:** Cập nhật tồn kho

**Tác nhân:** Nhân viên kho (Warehouse)

**Mục đích:** Use Case này cho phép nhân viên kho xác nhận phiếu nhập để
cộng số lượng vào tồn kho, đồng thời theo dõi tồn kho hiện tại và lịch
sử biến động của từng sản phẩm.

**Tiền điều kiện:**

- Nhân viên kho đã đăng nhập vào hệ thống.

- Có ít nhất một phiếu nhập ở trạng thái “Chờ xác nhận”.

**1. Luồng sự kiện chính**

*Bảng 3.x: Luồng sự kiện chính Use Case Cập nhật tồn kho*

| **Bước** | **Nhân viên kho** | **Hệ thống** |
|:---|:---|----|
| 1 | Chọn chức năng Cập nhật tồn kho. |  |
| 2 |  | Hiển thị danh sách phiếu nhập chờ xác nhận. |
| 3 | Chọn một phiếu để xem chi tiết. |  |
| 4 |  | Hiển thị chi tiết phiếu: nhà cung cấp, từng sản phẩm, số lượng, giá nhập, tổng tiền. |
| 5 | Nhấn nút Xác nhận nhập kho. |  |
| 6 |  | Hệ thống thực hiện: cập nhật trạng thái phiếu thành “Đã nhập kho”; cộng số lượng từng sản phẩm vào tồn kho; ghi lịch sử biến động (loại biến động, số lượng thay đổi, thời điểm, mã phiếu tham chiếu). |
| 7 |  | Hệ thống hiển thị thông báo “Cập nhật tồn kho thành công”. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

- **Xem tồn kho hiện tại:** nhân viên tìm sản phẩm theo tên hoặc mã, hệ
  thống hiển thị tồn hiện tại và cảnh báo các sản phẩm dưới ngưỡng tồn
  tối thiểu.

- **Xem lịch sử biến động:** nhân viên chọn một sản phẩm để xem lịch sử
  tăng giảm theo thời gian (nhập kho, bán hàng, kiểm kê).

- **Hủy phiếu:** tại bước 5, nhân viên chọn Hủy phiếu, hệ thống đổi
  trạng thái phiếu thành “Hủy” và không thay đổi tồn kho.

**b. Luồng ngoại lệ (Báo lỗi)**

- **Phiếu đã được xác nhận hoặc hủy trước đó:** hệ thống thông báo và
  làm mới danh sách phiếu chờ xác nhận.

- **Lỗi khi cập nhật tồn kho:** hệ thống hủy toàn bộ giao dịch
  (rollback), phiếu giữ nguyên trạng thái “Chờ xác nhận” và thông báo
  lỗi cho nhân viên.

**B**. **Sơ đồ trình tự**

<img src="docs/media/image16.png"
style="width:6.25972in;height:5.63056in" />

### 3.5.4. UC: DUYỆT PHIẾU KIỂM KÊ

**A. Đặc tả Use Case**

**Tên UC:** Duyệt phiếu kiểm kê

**Tác nhân:** Quản trị viên (Admin)

**Mục đích:** Use Case này cho phép quản trị viên xem xét phiếu kiểm kê
do nhân viên kho gửi lên, duyệt để cập nhật tồn kho theo số lượng thực
tế hoặc từ chối để nhân viên kho kiểm tra lại.

**Tiền điều kiện:**

Quản trị viên đã đăng nhập vào hệ thống.

Có ít nhất một phiếu kiểm kê ở trạng thái chờ duyệt.

**1. Luồng sự kiện chính**

*Bảng 3.14: Luồng sự kiện chính Use Case Duyệt phiếu kiểm kê*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Quản trị viên (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Quản trị viên chọn chức năng Duyệt phiếu kiểm kê. |  |
| 2 |  | Hệ thống hiển thị danh sách phiếu kiểm kê chờ duyệt. |
| 3 | Quản trị viên chọn một phiếu để xem chi tiết. |  |
| 4 |  | Hệ thống hiển thị chi tiết phiếu: từng sản phẩm, số hệ thống, số thực tế và chênh lệch. |
| 5 | Quản trị viên nhấn nút Duyệt. |  |
| 6 |  | Hệ thống thực hiện: cập nhật trạng thái phiếu thành đã duyệt; cập nhật tồn kho theo số lượng thực tế; ghi lịch sử thay đổi tồn kho và người duyệt. |
| 7 |  | Hệ thống hiển thị thông báo “Duyệt phiếu kiểm kê thành công”. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Lọc danh sách: tại bước 2, quản trị viên lọc phiếu theo ngày lập hoặc
nhóm hàng.

Từ chối phiếu: tại bước 5, quản trị viên chọn Từ chối và nhập lý do, hệ
thống trả phiếu về cho nhân viên kho chỉnh sửa và không thay đổi tồn
kho.

**b. Luồng ngoại lệ (Báo lỗi)**

Phiếu đã được xử lý trước đó: hệ thống thông báo và làm mới danh sách.

Từ chối nhưng chưa nhập lý do: hệ thống yêu cầu nhập lý do trước khi từ
chối.

Lỗi khi cập nhật tồn kho: hệ thống hủy toàn bộ giao dịch (rollback),
phiếu giữ nguyên trạng thái chờ duyệt.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image17.png"
style="width:6.65278in;height:9.38264in" />

**3.6. PHÂN HỆ QUẢN TRỊ HỆ THỐNG**

### 3.6.1. UC: QUẢN LÝ DANH MỤC HÀNG HÓA

**A. Đặc tả Use Case**

**Tên UC:** Quản lý danh mục hàng hóa

**Tác nhân:** Quản trị viên (Admin)

**Mục đích:** Use Case này cho phép quản trị viên thêm, sửa, ngừng bán
sản phẩm, combo và nhóm hàng, làm cơ sở dữ liệu chung cho website bán
hàng và màn hình POS.

**Tiền điều kiện:**

Quản trị viên đã đăng nhập vào hệ thống.

**1. Luồng sự kiện chính**

*Bảng 3.15: Luồng sự kiện chính Use Case Quản lý danh mục hàng hóa*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Quản trị viên (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Quản trị viên chọn mục cần quản lý (sản phẩm, combo hoặc nhóm hàng). |  |
| 2 |  | Hệ thống hiển thị danh sách của mục đã chọn. |
| 3 | Quản trị viên chọn Thêm mới, hoặc chọn một dòng để Sửa. |  |
| 4 |  | Hệ thống hiển thị biểu mẫu nhập liệu (kèm dữ liệu cũ nếu là sửa). |
| 5 | Quản trị viên nhập thông tin (mã, tên, giá, nhóm hàng, ảnh bìa, mô tả) và nhấn Lưu. |  |
| 6 |  | Hệ thống kiểm tra tính hợp lệ của dữ liệu (mã không trùng, trường bắt buộc đầy đủ, giá không âm). |
| 7 |  | Hệ thống lưu dữ liệu và cập nhật danh sách. |
| 8 |  | Hệ thống hiển thị thông báo lưu thành công. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Ngừng bán hoặc mở bán lại: quản trị viên đổi trạng thái sản phẩm, sản
phẩm ngừng bán không hiển thị trên website và POS.

Tạo combo: quản trị viên chọn nhiều sản phẩm, đặt số lượng và giá combo.

Tìm kiếm và lọc: quản trị viên tìm theo tên, mã hoặc lọc theo nhóm hàng.

**b. Luồng ngoại lệ (Báo lỗi)**

Trùng mã hoặc thiếu dữ liệu bắt buộc: tại bước 6, hệ thống báo đỏ tại ô
tương ứng và không cho lưu.

Ảnh bìa sai định dạng: hệ thống báo lỗi và yêu cầu chọn lại ảnh.

Sản phẩm đã phát sinh đơn hàng: hệ thống không cho xóa, chỉ cho chuyển
sang ngừng bán để giữ lịch sử đơn hàng.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image18.png"
style="width:6.75278in;height:9.38056in" />

### 3.6.2. UC: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN

**A. Đặc tả Use Case**

**Tên UC:** Quản lý tài khoản & Phân quyền

**Tác nhân:** Quản trị viên (Admin)

**Mục đích:** Use Case này cho phép quản trị viên tạo và quản lý tài
khoản nhân viên, gán vai trò để mỗi nhóm người dùng chỉ truy cập đúng
chức năng của mình.

**Tiền điều kiện:**

Quản trị viên đã đăng nhập vào hệ thống.

**1. Luồng sự kiện chính**

*Bảng 3.16: Luồng sự kiện chính Use Case Quản lý tài khoản & Phân quyền*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Quản trị viên (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Quản trị viên chọn chức năng Quản lý tài khoản. |  |
| 2 |  | Hệ thống hiển thị danh sách tài khoản (tên đăng nhập, họ tên, vai trò, trạng thái). |
| 3 | Quản trị viên chọn Thêm tài khoản. |  |
| 4 |  | Hệ thống hiển thị biểu mẫu tạo tài khoản. |
| 5 | Quản trị viên nhập tên đăng nhập, họ tên, email, chọn vai trò (nhân viên thu ngân, nhân viên kho, quản trị viên) và nhấn Lưu. |  |
| 6 |  | Hệ thống kiểm tra tên đăng nhập và email chưa tồn tại, dữ liệu đúng định dạng. |
| 7 |  | Hệ thống tạo mật khẩu tạm đã mã hóa, lưu tài khoản và gán vai trò. |
| 8 |  | Hệ thống hiển thị thông báo “Tạo tài khoản thành công”. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Sửa tài khoản: quản trị viên sửa thông tin hoặc đổi vai trò, thay đổi có
hiệu lực từ lần đăng nhập tiếp theo.

Khóa hoặc mở khóa tài khoản: tài khoản bị khóa không thể đăng nhập.

Đặt lại mật khẩu: hệ thống tạo mật khẩu tạm mới cho tài khoản.

**b. Luồng ngoại lệ (Báo lỗi)**

Tên đăng nhập hoặc email đã tồn tại: tại bước 6, hệ thống báo lỗi và
không tạo tài khoản.

Email sai định dạng: hệ thống báo lỗi tại ô tương ứng.

Khóa hoặc hạ quyền quản trị viên cuối cùng của hệ thống: hệ thống từ
chối để tránh mất quyền quản trị.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image19.png"
style="width:6.70694in;height:9.35208in" />

### 3.6.3. UC: XEM BÁO CÁO DOANH THU

**A. Đặc tả Use Case**

**Tên UC:** Xem báo cáo doanh thu

**Tác nhân:** Quản trị viên (Admin)

**Mục đích:** Use Case này cho phép quản trị viên theo dõi kết quả kinh
doanh của cả hai kênh bán hàng (POS và online) theo thời gian và nhóm
hàng để ra quyết định nhập hàng và khuyến mãi.

**Tiền điều kiện:**

Quản trị viên đã đăng nhập vào hệ thống.

Hệ thống đã có dữ liệu đơn hàng.

**1. Luồng sự kiện chính**

*Bảng 3.17: Luồng sự kiện chính Use Case Xem báo cáo doanh thu*

|  |  |  |
|:--:|:--:|:--:|
| **Bước** | **Hành động của Quản trị viên (Actor)** | **Phản hồi của Hệ thống (System)** |
| 1 | Quản trị viên chọn chức năng Báo cáo doanh thu. |  |
| 2 |  | Hệ thống hiển thị màn hình báo cáo với các bộ lọc. |
| 3 | Quản trị viên chọn khoảng thời gian, kênh bán (tất cả, POS, online), nhóm hàng và nhấn Xem báo cáo. |  |
| 4 |  | Hệ thống kiểm tra khoảng thời gian hợp lệ. |
| 5 |  | Hệ thống tổng hợp doanh thu và số đơn từ các đơn hàng theo tiêu chí đã chọn. |
| 6 |  | Hệ thống hiển thị kết quả dạng thẻ tổng quan, biểu đồ và bảng chi tiết. |

**2. Các luồng khác**

**a. Luồng phụ (Hợp lệ)**

Đổi cách nhóm số liệu: quản trị viên chọn nhóm theo ngày, tuần hoặc
tháng, hệ thống vẽ lại biểu đồ.

So sánh kênh bán: hệ thống hiển thị doanh thu POS và online cạnh nhau
trên cùng biểu đồ.

**b. Luồng ngoại lệ (Báo lỗi)**

Từ ngày lớn hơn đến ngày: tại bước 4, hệ thống báo lỗi và yêu cầu chọn
lại khoảng thời gian.

Không có dữ liệu trong khoảng đã chọn: hệ thống hiển thị trống kèm thông
báo không có dữ liệu.

**\**

**B**. **Sơ đồ trình tự**

<img src="docs/media/image20.png"
style="width:6.40139in;height:9.10486in" />

**3.7. SƠ ĐỒ LỚP VÀ SƠ ĐỒ ERD**

**3.7.1 SƠ ĐỒ LỚP**

<img src="docs/media/image21.png"
style="width:6.775in;height:3.10972in" />

**3.7.2. SƠ ĐỒ ERD**

<img src="docs/media/image22.png"
style="width:6.26736in;height:3.19722in" />

**\**

## 3.8. Thiết kế kiến trúc hệ thống

Hệ thống quản lý nhà sách BookMark được xây dựng dựa trên mô hình kiến
trúc 3 lớp (3-Tier Architecture) kết hợp với các dịch vụ bên ngoài
(Third-party services). Việc áp dụng mô hình này giúp phân tách rõ ràng
trách nhiệm của từng phần, giảm sự phụ thuộc lẫn nhau, từ đó tăng cường
tính bảo mật, dễ dàng bảo trì và mở rộng hệ thống trong tương lai.

#### **3.8.1. Lược đồ mô hình kiến trúc 3 lớp (3-Tier Architecture)**

<img src="docs/media/image23.png"
style="width:6.25833in;height:5.76944in" />

Kiến trúc của hệ thống được chia thành 3 tầng chính, giao tiếp với nhau
thông qua chuẩn RESTful API:

**1. Tầng giao diện người dùng (Presentation Tier / Client)** Đây là
tầng tương tác trực tiếp với người dùng cuối. Để tối ưu hóa hiệu suất và
tính bảo mật, tầng này được chia thành hai ứng dụng độc lập:

**Ứng dụng Khách hàng (Customer Web App):** Phục vụ việc mua sắm trực
tuyến, tìm kiếm sách, quản lý giỏ hàng và đặt trước.

**Ứng dụng Nội bộ (POS & Admin Dashboard):** Phục vụ cho nhân viên thu
ngân bán hàng tại quầy, nhân viên kho quản lý xuất nhập tồn và quản trị
viên xem báo cáo.

**Nhiệm vụ:** Thu thập thao tác của người dùng, thực hiện kiểm tra dữ
liệu cơ bản ở phía client (Client-side validation), gọi các API từ máy
chủ để lấy/gửi dữ liệu và render giao diện bằng thư viện **ReactJS**
(kết hợp Tailwind CSS và Ant Design).

**2. Tầng xử lý logic nghiệp vụ (Application Tier / Backend)** Đây là bộ
não của hệ thống, nơi chứa toàn bộ quy tắc nghiệp vụ (Business Rules).
Tầng này được xây dựng bằng **Node.js** và framework **Express.js**. Các
thành phần cốt lõi bao gồm:

**API Gateway & Security (Middleware):** Đóng vai trò là cửa ngõ tiếp
nhận mọi request từ Client. Đảm nhiệm việc xác thực danh tính bằng **JWT
(JSON Web Token)**, mã hóa mật khẩu bằng **bcrypt**, và phân quyền
(RBAC) để đảm bảo người dùng chỉ được gọi các API thuộc quyền hạn của
mình.

**Các Module nghiệp vụ lõi (Services/Controllers):** Xử lý logic cụ thể
của từng phân hệ như: Xử lý giỏ hàng và đơn hàng (ModSales), Quản lý
xuất nhập tồn và kiểm kê (ModInventory), Quản lý người dùng (ModUser).

**Module Tích hợp (Payment Service):** Đảm nhiệm việc giao tiếp với các
dịch vụ bên ngoài. Cụ thể là khởi tạo giao dịch và xử lý phản hồi
(callback/webhook) từ cổng thanh toán điện tử (VNPay sandbox).

**3. Tầng lưu trữ dữ liệu (Data Tier)**

**Nhiệm vụ:** Đảm bảo lưu trữ dữ liệu an toàn, nhất quán và bền vững.

**Công nghệ sử dụng:** Hệ quản trị cơ sở dữ liệu quan hệ **PostgreSQL**.
Hệ thống tương tác với cơ sở dữ liệu thông qua **Prisma ORM**.

Tầng này khai thác triệt để cơ chế Transaction của PostgreSQL để đảm bảo
tính toàn vẹn dữ liệu (ACID). Ví dụ: Trong nghiệp vụ thanh toán (UC05),
thao tác tạo hóa đơn, trừ số lượng tồn kho và cộng điểm tích lũy phải
được thực hiện thành công toàn bộ, nếu có lỗi xảy ra ở bất kỳ bước nào,
toàn bộ quá trình sẽ được hoàn tác (rollback).

#### **3.8.2. Cấu trúc thư mục frontend và backend**

Để dự án được tổ chức khoa học và dễ quản lý khi làm việc nhóm, mã nguồn
(source code) của hệ thống được chia thành hai phần chính với cấu trúc
thư mục tiêu chuẩn như sau:

**1. Cấu trúc thư mục Frontend (ReactJS)** Ứng dụng frontend áp dụng
nguyên tắc thiết kế Component-based, cấu trúc cơ bản bao gồm:

src/assets/: Chứa các tài nguyên tĩnh như hình ảnh, biểu tượng, font
chữ.

src/components/: Chứa các thành phần giao diện dùng chung, có thể tái sử
dụng (như Header, Footer, Button, Table, Modal).

src/layouts/: Chứa các bố cục trang (layout) dành riêng cho từng nhóm
người dùng (ví dụ: AdminLayout, CustomerLayout).

src/pages/: Chứa các component đại diện cho toàn bộ một màn hình cụ thể
(như HomePage, CartPage, Dashboard).

src/routes/: Cấu hình định tuyến (React Router), phân luồng các đường
dẫn (URL) đến đúng các pages và kiểm tra quyền truy cập màn hình.

src/services/: Chứa các hàm gọi API (sử dụng Axios hoặc Fetch) để giao
tiếp với Backend.

src/utils/: Chứa các hàm tiện ích hỗ trợ (format tiền tệ, xử lý ngày
tháng).

**2. Cấu trúc thư mục Backend (Node.js/Express)** Ứng dụng backend được
thiết kế bám sát mô hình MVC (Model-View-Controller) nhưng tối ưu hóa
cho REST API:

prisma/: Chứa tệp schema.prisma định nghĩa cấu trúc các bảng trong cơ sở
dữ liệu và các file migration.

src/routes/: Định nghĩa các endpoint (URL) của API và liên kết chúng với
các hàm xử lý tương ứng trong Controller.

src/controllers/: Chứa logic tiếp nhận request (req) từ client, trích
xuất dữ liệu, gọi đến tầng Service và trả về response (res) định dạng
JSON.

src/services/: Nơi chứa toàn bộ logic nghiệp vụ (Business logic).
Controller sẽ gọi Service để xử lý tính toán, truy vấn database thông
qua Prisma Client.

src/middlewares/: Chứa các hàm trung gian xử lý trước khi request lọt
vào Controller (ví dụ: authMiddleware.js để kiểm tra JWT,
validateMiddleware.js để kiểm tra dữ liệu bằng Zod).

src/utils/: Các hàm hỗ trợ dùng chung (tạo token, băm mật khẩu, xử lý
chữ ký thanh toán).

**\**

## 3.9. Thiết kế cơ sở dữ liệu

Hệ thống sử dụng hệ quản trị cơ sở dữ liệu quan hệ **PostgreSQL** kết
hợp với **Prisma ORM** để định nghĩa cấu trúc và quản lý truy vấn. Các
bảng được thiết kế đảm bảo chuẩn hóa (Normal Form) nhằm tránh dư thừa dữ
liệu và đảm bảo tính toàn vẹn (ACID) cho các giao dịch.

#### **3.9.1. Lược đồ diagram**

<img src="docs/media/image22.png"
style="width:6.26736in;height:3.19722in" />

#### **3.9.2. Bảng mô tả chi tiết**

Dưới đây là từ điển dữ liệu (Data Dictionary) mô tả chi tiết các thuộc
tính của các thực thể cốt lõi trong hệ thống:

**1. Nhóm Quản lý Tài khoản & Người dùng**

**Bảng TaiKhoan (Tài khoản hệ thống)**: Lưu trữ thông tin đăng nhập của
nhân viên và quản trị viên.

|  |  |  |  |
|:---|:---|:---|:---|
| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả** |
| id | UUID | PK | Định danh duy nhất của tài khoản |
| username | VARCHAR(50) | UK | Tên đăng nhập (duy nhất) |
| password_hash | VARCHAR(255) |  | Mật khẩu đã băm (bcrypt) |
| vai_tro_id | INT | FK | ID vai trò (Tham chiếu bảng VaiTro) |
| trang_thai | BOOLEAN |  | Trạng thái (Hoạt động / Khóa) |

- **Bảng KhachHang (Khách hàng)**: Thông tin khách hàng mua sắm online
  hoặc có thẻ thành viên.

| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả**                        |
|:---------------|:-----------------|:---------|:---------------------------------|
| id             | UUID             | PK       | Mã khách hàng                    |
| ho_ten         | VARCHAR(100)     |          | Họ và tên khách hàng             |
| sdt            | VARCHAR(15)      | UK       | Số điện thoại (duy nhất)         |
| email          | VARCHAR(100)     |          | Địa chỉ Email                    |
| diem_tich_luy  | INT              |          | Điểm thưởng hiện có (Mặc định 0) |

**2. Nhóm Sản phẩm & Danh mục**

- **Bảng SanPham (Sản phẩm / Sách)**

|  |  |  |  |
|:---|:---|:---|:---|
| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả** |
| id | UUID | PK | Định danh sản phẩm |
| ma_sp | VARCHAR(20) | UK | Mã sản phẩm (Barcode) |
| ten_sp | VARCHAR(255) |  | Tên sách / VPP |
| danh_muc_id | INT | FK | Mã danh mục |
| gia_ban | DECIMAL(12,2) |  | Giá bán niêm yết |
| so_luong_ton | INT |  | Số lượng tồn kho thực tế |
| vai_tro_id | INT | FK | ID vai trò (Tham chiếu bảng VaiTro) |

**3. Nhóm Bán hàng & Thanh toán (Online + POS)**

- **Bảng DonHang (Đơn hàng chung)**

| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả** |
|:---|:---|:---|:---|
| id | UUID | PK | Định danh đơn hàn |
| ma_dh | VARCHAR(20) | UK | Mã đơn hàng hiển thị |
| khach_hang_id | UUID | FK | Mã khách (Có thể NULL nếu mua lẻ POS) |
| tong_tien | DECIMAL(12,2) |  | Tổng tiền phải thanh toán |
| kenh_ban | VARCHAR(20) |  | Online / POS |
| trang_thai | VARCHAR(50) |  | Chờ thanh toán / Đã thanh toán / Hủy |
| ngay_tao | TIMESTAMP |  | Thời gian tạo đơn |
| ten_nguoi_nhan | VARCHAR(100) |  | Tên người nhận hàng (phục vụ đơn Online). |
| sdt_nguoi_nhan | VARCHAR(15) |  | Số điện thoại liên hệ giao hàng. |
| dia_chi_giao_hang | TEXT |  | Địa chỉ nhận hàng chi tiết. |

- **Bảng ChiTietDonHang (Chi tiết giỏ hàng/đơn hàng)**

|                |                  |          |                           |
|:---------------|:-----------------|:---------|:--------------------------|
| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả**                 |
| don_hang_id    | UUID             | PK, FK   | Mã đơn hàng               |
| san_pham_id    | UUID             | PK, FK   | Mã sản phẩm               |
| so_luong       | INT              |          | Số lượng mua              |
| don_gia        | DECIMAL(12,2)    |          | Giá bán tại thời điểm mua |

- **Bảng ThanhToan (Lịch sử giao dịch)**

| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả**                         |
|:---------------|:-----------------|:---------|:----------------------------------|
| id             | UUID             | PK       | Định danh giao dịch               |
| don_hang_id    | UUID             | FK       | Thuộc đơn hàng nào                |
| phuong_thuc    | VARCHAR(50)      |          | VNPay / Tiền mặt                  |
| so_tien        | DECIMAL(12,2)    |          | Số tiền đã thanh toán             |
| ma_giao_dich   | VARCHAR(100)     |          | Mã GD từ Cổng thanh toán (nếu có) |

**4. Nhóm Quản lý Kho bãi**

- **Bảng PhieuNhapKho (Phiếu nhập)**

| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả**                  |
|:---------------|:-----------------|:---------|:---------------------------|
| id             | UUID             | PK       | Định danh phiếu nhập       |
| ma_pn          | VARCHAR(20)      | UK       | Mã phiếu nhập hiển thị     |
| nha_cung_cap   | UUID             | FK       | Tham chiếu bảng NhaCungCap |
| nguoi_lap      | UUID             | FK       | Nhân viên kho thực hiện    |
| tong_tien      | DECIMAL(12,2)    |          | Tổng giá trị nhập kho      |
| ngay_nhap      | DATETIME         |          | Ngày tiến hành nhập kho    |

- **Bảng ChiTietPhieuNhap**

| **Tên trường** | **Kiểu dữ liệu** | **Khóa** | **Mô tả**           |
|:---------------|:-----------------|:---------|:--------------------|
| phieu_nhap_id  | UUID             | PK, FK   | Mã phiếu nhập       |
| san_pham_id    | UUID             | PK, FK   | Mã sản phẩm         |
| so_luong       | INT              |          | Số lượng nhập       |
| gia_nhap       | DECIMAL(12,2)    |          | Đơn giá nhập từ NCC |

**Bảng VaiTro (Lưu trữ các nhóm quyền người dùng như Admin, Thu ngân,
Nhân viên kho, Khách hàng)**

| **Tên trường** | **Kiểu dữ liệu (PostgreSQL)** | **Khóa** | **Bắt buộc (Not Null)** | **Mô tả ý nghĩa** |
|:---|:---|:---|:---|:---|
| vai_tro_id | SERIAL / INT | PK | Có | Mã định danh duy nhất của vai trò |
| ten_vai_tro | VARCHAR(50) |  | Có | Tên vai trò (VD: Admin, Thu Ngân...) |
| mo_ta | TEXT |  | Không | Diễn giải chi tiết về quyền hạn của vai trò |
| ngay_tao | TIMESTAMP |  | Có | Thời gian khởi tạo dữ liệu |

**Bảng NhaCungCap (Thông tin các đơn vị cung cấp nguồn hàng cho nhà
sách)**

|  |  |  |  |  |
|:---|:---|:---|:---|:---|
| **Tên trường** | **Kiểu dữ liệu (PostgreSQL)** | **Khóa** | **Bắt buộc (Not Null)** | **Mô tả ý nghĩa** |
| nha_cung_cap_id | SERIAL / INT | PK | Có | Mã định danh duy nhất của nhà cung cấp |
| ten_nha_cung_cap | VARCHAR(255) |  | Có | Tên đầy đủ của đối tác / nhà xuất bản |
| sdt_lien_he | VARCHAR(15) |  | Có | Số điện thoại đại diện |
| email | VARCHAR(100) |  | Không | Địa chỉ thư điện tử |
| dia_chi | TEXT |  | Không | Trụ sở / Địa chỉ kho của nhà cung cấp |

1\. Bảng VaiTro (Lưu trữ các nhóm quyền người dùng như Admin, Thu ngân,
Nhân viên kho, Khách hàng)

### 3.10. Thiết kế API

Hệ thống giao tiếp giữa Frontend (ReactJS) và Backend (Node.js/Express)
thông qua chuẩn RESTful API. Dữ liệu trao đổi dưới định dạng JSON. Các
endpoint được gom nhóm theo module nghiệp vụ (Domain-driven) và được bảo
vệ bằng JWT Middleware.

**1. Module Xác thực & Phân quyền (Auth & User API)**

| **HTTP Method** | **Endpoint** | **Mô tả** | **Middleware (Quyền)** |
|:---|:---|:---|:---|
| POST | /api/v1/auth/login | Đăng nhập cấp Token (JWT) | Public |
| POST | /api/v1/auth/register | Khách hàng đăng ký tài khoản | Public |
| GET | /api/v1/users/me | Lấy thông tin tài khoản đang login | Any Role |
| GET | /api/v1/users | Lấy danh sách tài khoản nội bộ | Admin |

**2. Module Sản phẩm & Danh mục (Product API)**

|  |  |  |  |
|:---|:---|:---|:---|
| **HTTP Method** | **Endpoint** | **Mô tả** | **Middleware (Quyền)** |
| GET | /api/v1/products | Lấy danh sách SP (có phân trang, filter) | Public |
| GET | /api/v1/products/:id | Xem chi tiết 1 sản phẩm / bộ truyện | Public |
| POST | /api/v1/products | Thêm mới sản phẩm | Admin |
| PUT | /api/v1/products/:id | Cập nhật thông tin sản phẩm | Admin |

**3. Module Bán hàng & Thanh toán (Sales & Payment API)**

| **HTTP Method** | **Endpoint** | **Mô tả** | **Middleware (Quyền)** |
|:---|:---|:---|:---|
| POST | /api/v1/orders/pos | Thu ngân chốt đơn & in hóa đơn POS | Cashier |
| POST | /api/v1/orders/online | Khách đặt hàng trực tuyến | Customer |
| GET | /api/v1/orders/:id | Xem chi tiết đơn hàng | Customer, Admin |
| POST | /api/v1/payment/vnpay | Tạo URL thanh toán VNPay | Customer |
| POST | /api/v1/payment/callback | Webhook nhận kết quả từ Cổng TT | Public (Server-to-Server) |

**4. Module Quản lý Kho (Inventory API)**

|  |  |  |  |
|:---|:---|:---|:---|
| **HTTP Method** | **Endpoint** | **Mô tả** | **Middleware (Quyền)** |
| GET | /api/v1/inventory | Xem danh sách tồn kho hiện tại | Kho, Admin, Cashier |
| POST | /api/v1/inventory/imports | Lập phiếu nhập kho mới | Kho |
| POST | /api/v1/inventory/checks | Lập phiếu kiểm kê (chờ duyệt) | Kho |
| PUT | /api/v1/inventory/checks/:id | Admin duyệt phiếu kiểm kê | Admin |

**5. Module Báo cáo & Thống kê (Report API)**

| **HTTP Method** | **Endpoint** | **Mô tả** | **Middleware (Quyền)** |
|:---|:---|:---|:---|
| GET | /api/v1/reports/revenue | Thống kê doanh thu (theo ngày/tháng) | Admin |

**\**

## CHƯƠNG 4: XÂY DỰNG HỆ THỐNG

### 4.1. Giao diện khách hàng (Kênh bán hàng trực tuyến)

Giao diện khách hàng được xây dựng theo tiêu chuẩn thương mại điện tử
hiện đại, phục vụ cho các Use Case từ UC10 đến UC14:

**Trang chủ và Tìm kiếm (UC11):** Hiển thị các danh mục sách, truyện
tranh hot, combo khuyến mãi và thanh tìm kiếm từ khóa theo real-time. Bộ
lọc cho phép phân loại theo thể loại, khoảng giá và nhà xuất bản.

**Trang Chi tiết sản phẩm & Đặt trước (UC13):** Hiển thị chi tiết thông
tin sách, số lượng tồn kho và các thành phần trong combo. Đối với các
đầu sách chưa phát hành hoặc tạm hết hàng, hệ thống hỗ trợ nút "Đặt
trước (Pre-order)".

**Giỏ hàng online (UC12):** Cho phép khách hàng quản lý danh sách sản
phẩm cần mua, điều chỉnh số lượng và tự động tính tổng tiền.

**Thanh toán trực tuyến (UC14):** Ghi nhận địa chỉ giao hàng và kết nối
trực tiếp với giao diện sandbox của cổng thanh toán VNPay. Sau khi xác
nhận thanh toán thành công, hệ thống tự động trừ tồn kho và làm trống
giỏ hàng.

*(Sinh viên chèn các hình ảnh chụp màn hình giao diện Khách hàng tương
ứng: Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Màn hình thanh toán VNPay)*

### 4.2. Giao diện POS (Nhân viên thu ngân)

Giao diện bán hàng tại quầy (POS) được thiết kế tối giản, tập trung vào
tốc độ thao tác cho thu ngân, đáp ứng các Use Case UC01 đến UC05 :

**Màn hình Đăng nhập POS (UC01):** Xác thực tài khoản và chỉ cấp quyền
truy cập cho người dùng có vai trò Thu ngân.

**Màn hình Tra cứu & Lập giỏ hàng POS (UC02, UC03):** Hỗ trợ tra cứu
nhanh sản phẩm qua Barcode/Tên, hiển thị giá và tồn kho khả dụng tức
thì.

**Áp dụng Mã giảm giá & Tích điểm (UC04):** Nhập số điện thoại khách
thành viên để tích điểm hoặc dùng điểm giảm trừ trực tiếp trên đơn hàng.

**Thanh toán & In hóa đơn (UC05):** Tính tiền khách đưa, tiền thừa và
xuất giao diện in hóa đơn điện tử/hóa đơn nhiệt.

*(Sinh viên chèn các hình ảnh chụp màn hình POS tương ứng: Màn hình bán
hàng POS, Popup áp dụng Voucher/Tích điểm, Giao diện Hóa đơn bán hàng)*

### 4.3. Giao diện nhân viên kho

Giao diện phân hệ Kho tập trung vào việc quản lý dữ liệu lưu trữ vật lý,
hỗ trợ các Use Case UC06, UC07 và UC08:

**Lập phiếu nhập kho (UC06):** Cho phép chọn nhà cung cấp, tìm kiếm sản
phẩm và nhập số lượng, giá nhập.

**Cập nhật tồn kho (UC07):** Danh sách theo dõi chi tiết biến động tồn
kho thực tế của từng đầu sách/VPP.

**Lập phiếu kiểm kê (UC08):** Hỗ trợ nhập số lượng kiểm đếm thực tế theo
từng nhóm hàng, tự động tính toán chênh lệch (thừa/thiếu) so với dữ liệu
trên phần mềm và gửi lên Quản trị viên phê duyệt.

*(Sinh viên chèn các hình ảnh chụp màn hình phân hệ Kho: Form Lập phiếu
nhập kho, Màn hình Bảng kiểm kê kho)*

### 4.4. Giao diện quản trị viên

Dành riêng cho Cấp quản lý/Chủ nhà sách để điều hành và theo dõi toàn bộ
hoạt động, bao gồm các Use Case UC09, UC15, UC16 và UC17:

**Quản lý Danh mục & Sản phẩm (UC15):** Thêm, sửa, cập nhật giá bán,
ngừng kinh doanh sản phẩm hoặc đóng gói bộ truyện/combo.

**Duyệt phiếu kiểm kê (UC09):** Xem danh sách phiếu kiểm kê từ bộ phận
kho gửi lên, xem lý do chênh lệch và bấm Duyệt (để hệ thống tự động cân
bằng tồn kho) hoặc Từ chối.

**Quản lý Tài khoản & Phân quyền (UC16):** Cấp tài khoản mới cho nhân
viên, gán nhóm vai trò (Admin, Thu ngân, Kho) và khóa tài khoản khi cần.

**Báo cáo Doanh thu (UC17):** Hiển thị biểu đồ doanh thu trực quan
(ngày/tháng/kênh bán), thống kê top sản phẩm bán chạy và tỷ trọng doanh
thu giữa POS và Online.

*(Sinh viên chèn các hình ảnh chụp màn hình Admin: Dashboard báo cáo
biểu đồ, Giao diện Quản lý sản phẩm, Giao diện Duyệt kiểm kê)*

## CHƯƠNG 5: KẾT QUẢ THỰC HIỆN

### 5.1. Kết quả đạt được

Sau thời gian nghiên cứu và thực hiện đề tài "Hệ thống quản lý kinh
doanh nhà sách BookMark", nhóm đã hoàn thành các mục tiêu đặt ra ban
đầu:

1.  **Về Phân tích & Thiết kế:**

    Hoàn thiện bộ tài liệu đặc tả yêu cầu chức năng và phi chức năng.

    Xây dựng đầy đủ các sơ đồ UML tiêu chuẩn bao gồm: Sơ đồ Use Case
    tổng quát (17 Use Case), Sơ đồ lớp (Class Diagram), các Sơ đồ trình
    tự (Sequence Diagram) và Sơ đồ Thực thể Liên kết (ERD).

    Thiết kế kiến trúc hệ thống 3 lớp (3-Tier Architecture) vững chắc và
    thiết kế hệ thống RESTful API chi tiết theo module.

2.  **Về Xây dựng Phần mềm:**

    Xây dựng thành công ứng dụng web đồng bộ dữ liệu giữa hai kênh: Bán
    hàng trực tiếp tại quầy (POS) và Bán hàng trực tuyến (Online) trên
    cùng một CSDL PostgreSQL.

    Cài đặt đầy đủ 17 Use Case nghiệp vụ chính: Đăng ký/đăng nhập, Tìm
    kiếm combo, Đặt trước sách, POS bán hàng, Nhập kho, Kiểm kê có
    duyệt, Phân quyền RBAC và Báo cáo biểu đồ.

    Tích hợp thành công luồng thanh toán thử nghiệm (Sandbox) qua cổng
    thanh toán điện tử VNPay với cơ chế xác minh chữ ký bảo mật.

    Đảm bảo tính toàn vẹn dữ liệu thông qua cơ chế Transaction (ACID)
    của PostgreSQL trong các thao tác phức tạp như chốt đơn POS, nhập
    kho và duyệt kiểm kê.

### 5.2. Hạn chế

Mặc dù đã hoàn thành các chức năng cốt lõi, hệ thống vẫn còn một số hạn
chế do rào cản thời gian và phạm vi đồ án học tập:

Chưa kết nối trực tiếp với các thiết bị phần cứng chuyên dụng tại quầy
như máy in hóa đơn nhiệt tự động, máy quét mã vạch cầm tay hay két tiền
(việc in hóa đơn hiện dừng ở mức xuất lệnh in từ trình duyệt/xuất file
PDF).

Hệ thống thanh toán trực tuyến mới chỉ dừng lại ở môi trường Sandbox thử
nghiệm, chưa đăng ký tích hợp tài khoản doanh nghiệp thật.

Chưa tích hợp API của các đơn vị vận chuyển (như Giao Hàng Nhanh,
Viettel Post) để tự động tính phí giao hàng và theo dõi hành trình đơn
hàng online.

Chưa phát triển ứng dụng di động (Mobile App) riêng biệt cho hệ điều
hành iOS/Android.

### 5.3. Hướng phát triển

> Từ những hạn chế trên, nhóm đề xuất các hướng nâng cấp và phát triển
> hệ thống trong tương lai:

1.  **Mở rộng kết nối phần cứng:** Tích hợp WebUSB / WebBluetooth API để
    giao tiếp trực tiếp với đầu đọc mã vạch và máy in hóa đơn khổ nhỏ
    (K80) tại quầy POS.

2.  **Tích hợp Đơn vị Vận chuyển & Zalo ZNS:** Kết nối API giao hàng tự
    động, bổ sung tính năng gửi tin nhắn Zalo Notification Service (ZNS)
    thông báo trạng thái đơn hàng/đơn đặt trước cho khách hàng.

3.  **Đa chi nhánh & Quản lý nâng cao:** Mở rộng mô hình CSDL để quản lý
    nhà sách chuỗi (đa kho, đa cửa hàng), bổ sung phân hệ kế toán chi
    tiết, tính lương nhân viên và quản lý chương trình khuyến mãi phức
    tạp (Voucher theo khung giờ, Mua 1 Tặng 1).

4.  **Ứng dụng AI vào gợi ý sản phẩm:** Sử dụng thuật toán Học máy
    (Machine Learning) để phân tích hành vi mua sắm của khách hàng, từ
    đó gợi ý các đầu sách hoặc bộ truyện combo phù hợp trên website.
