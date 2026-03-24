<%-- Root index.jsp: just redirect to the ProductServlet --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<% response.sendRedirect(request.getContextPath() + "/products"); %>
