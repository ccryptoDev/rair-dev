import styled from 'styled-components';

export const Alert = styled.div`
  width: 100%;
  height: 50px;
  position: fixed;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  background: var(--yellow-alert);
  z-index: 101;
  transition: background 0.5s ease;
  cursor: default;

  :hover {
    color: white;
    background: #7400af;
  }
  @media (max-width: 500px) {
    height: 50px;
    font-size: 12px;
  }

  svg {
    cursor: pointer;
  }
`;
